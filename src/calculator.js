/**
 * Core mathematical operations and precision utilities.
 */

export const Operations = Object.freeze({
  ADD: '+',
  SUBTRACT: '-',
  MULTIPLY: '×',
  DIVIDE: '÷'
});

/**
 * Perform safe arithmetic avoiding standard IEEE 754 precision issues (e.g. 0.1 + 0.2).
 */
export function roundToPrecision(num, decimals = 10) {
  if (!Number.isFinite(num)) return num;
  return Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals);
}

export function add(a, b) {
  return roundToPrecision(Number(a) + Number(b));
}

export function subtract(a, b) {
  return roundToPrecision(Number(a) - Number(b));
}

export function multiply(a, b) {
  return roundToPrecision(Number(a) * Number(b));
}

export function divide(a, b) {
  const divisor = Number(b);
  if (divisor === 0) {
    throw new Error('Cannot divide by zero');
  }
  return roundToPrecision(Number(a) / divisor);
}

/**
 * Stateful Calculator Engine supporting interactive operations,
 * chaining, input formatting, error states, and history.
 */
export class Calculator {
  constructor() {
    this.clear();
    this.history = [];
  }

  /**
   * Resets current active calculation state.
   */
  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.shouldResetScreen = false;
    this.isError = false;
    this.errorMessage = '';
  }

  /**
   * Clears everything including calculation history.
   */
  allClear() {
    this.clear();
    this.history = [];
  }

  /**
   * Removes the last entered character from the current operand.
   */
  delete() {
    if (this.isError) {
      this.clear();
      return;
    }
    if (this.shouldResetScreen) {
      this.currentOperand = '0';
      this.shouldResetScreen = false;
      return;
    }
    if (this.currentOperand === '0' || this.currentOperand === '-0') {
      return;
    }
    if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
  }

  /**
   * Appends a digit or decimal point to the current operand.
   */
  appendNumber(number) {
    if (this.isError) {
      this.clear();
    }
    const strNumber = String(number);

    if (this.shouldResetScreen) {
      this.currentOperand = strNumber === '.' ? '0.' : strNumber;
      this.shouldResetScreen = false;
      return;
    }

    if (strNumber === '.') {
      if (this.currentOperand.includes('.')) return;
      this.currentOperand += '.';
      return;
    }

    if (this.currentOperand === '0') {
      this.currentOperand = strNumber;
    } else if (this.currentOperand === '-0') {
      this.currentOperand = '-' + strNumber;
    } else {
      this.currentOperand += strNumber;
    }
  }

  /**
   * Toggles positive/negative sign of the current operand.
   */
  toggleSign() {
    if (this.isError) return;
    if (this.currentOperand === '0') return;

    if (this.currentOperand.startsWith('-')) {
      this.currentOperand = this.currentOperand.slice(1);
    } else {
      this.currentOperand = '-' + this.currentOperand;
    }
  }

  /**
   * Converts current operand to a percentage (divides by 100).
   */
  percentage() {
    if (this.isError) return;
    const current = parseFloat(this.currentOperand);
    if (isNaN(current)) return;

    const result = roundToPrecision(current / 100);
    this.currentOperand = String(result);
    this.shouldResetScreen = true;
  }

  /**
   * Normalizes operation symbol.
   */
  normalizeOperation(op) {
    switch (op) {
      case '+': return Operations.ADD;
      case '-': return Operations.SUBTRACT;
      case '*':
      case 'x':
      case 'X':
      case '×': return Operations.MULTIPLY;
      case '/':
      case '÷': return Operations.DIVIDE;
      default: return op;
    }
  }

  /**
   * Selects an arithmetic operation (+, -, ×, ÷).
   */
  chooseOperation(operation) {
    if (this.isError) return;
    const normalizedOp = this.normalizeOperation(operation);

    if (this.currentOperand === '' && this.previousOperand === '') return;

    if (this.previousOperand !== '' && this.operation && !this.shouldResetScreen) {
      this.compute();
      if (this.isError) return;
    }

    this.operation = normalizedOp;
    this.previousOperand = this.currentOperand;
    this.shouldResetScreen = true;
  }

  /**
   * Computes the result of the pending calculation.
   */
  compute() {
    if (this.isError || !this.operation || this.previousOperand === '') {
      return;
    }

    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current)) return;

    let computation;
    try {
      switch (this.operation) {
        case Operations.ADD:
          computation = add(prev, current);
          break;
        case Operations.SUBTRACT:
          computation = subtract(prev, current);
          break;
        case Operations.MULTIPLY:
          computation = multiply(prev, current);
          break;
        case Operations.DIVIDE:
          computation = divide(prev, current);
          break;
        default:
          return;
      }

      const expression = `${this.previousOperand} ${this.operation} ${this.currentOperand}`;
      this.history.unshift({
        expression,
        result: String(computation),
        timestamp: new Date().toISOString()
      });

      this.currentOperand = String(computation);
      this.operation = undefined;
      this.previousOperand = '';
      this.shouldResetScreen = true;
    } catch (err) {
      this.isError = true;
      this.errorMessage = err.message || 'Error';
      this.currentOperand = this.errorMessage;
      this.operation = undefined;
      this.previousOperand = '';
      this.shouldResetScreen = true;
    }
  }

  /**
   * Returns formatted display values for UI presentation.
   */
  getDisplay() {
    if (this.isError) {
      return {
        previous: '',
        current: this.errorMessage || 'Error',
        isError: true
      };
    }

    let previousDisplay = '';
    if (this.previousOperand !== '' && this.operation) {
      previousDisplay = `${this.formatNumber(this.previousOperand)} ${this.operation}`;
    }

    return {
      previous: previousDisplay,
      current: this.formatNumber(this.currentOperand),
      isError: false
    };
  }

  /**
   * Helper to format numbers with localized digit separators while preserving decimals.
   */
  formatNumber(numberStr) {
    if (!numberStr || numberStr === '') return '0';
    if (numberStr === '-') return '-';

    const [integerPart, decimalPart] = numberStr.split('.');
    const integerNumber = parseFloat(integerPart);

    let formattedInteger = '';
    if (isNaN(integerNumber)) {
      formattedInteger = '0';
    } else {
      formattedInteger = integerNumber.toLocaleString('en', { maximumFractionDigits: 0 });
    }

    if (decimalPart != null) {
      return `${formattedInteger}.${decimalPart}`;
    }
    return formattedInteger;
  }
}
