import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  Operations,
  roundToPrecision,
  add,
  subtract,
  multiply,
  divide,
  Calculator
} from '../src/calculator.js';

describe('Math utilities', () => {
  it('adds numbers correctly including floating point precision', () => {
    assert.equal(add(1, 2), 3);
    assert.equal(add(0.1, 0.2), 0.3);
    assert.equal(add(-5, 10), 5);
  });

  it('subtracts numbers correctly', () => {
    assert.equal(subtract(5, 3), 2);
    assert.equal(subtract(0.3, 0.1), 0.2);
    assert.equal(subtract(2, 5), -3);
  });

  it('multiplies numbers correctly', () => {
    assert.equal(multiply(3, 4), 12);
    assert.equal(multiply(0.2, 0.1), 0.02);
    assert.equal(multiply(-2, 3), -6);
  });

  it('divides numbers correctly', () => {
    assert.equal(divide(10, 2), 5);
    assert.equal(divide(1, 3), 0.3333333333);
  });

  it('throws on division by zero', () => {
    assert.throws(() => divide(10, 0), /Cannot divide by zero/);
  });
});

describe('Calculator Class', () => {
  let calc;

  beforeEach(() => {
    calc = new Calculator();
  });

  it('initializes with default state', () => {
    assert.equal(calc.currentOperand, '0');
    assert.equal(calc.previousOperand, '');
    assert.equal(calc.operation, undefined);
    assert.equal(calc.isError, false);
    assert.deepEqual(calc.history, []);
  });

  it('appends numbers and respects single decimal point', () => {
    calc.appendNumber('1');
    calc.appendNumber('2');
    calc.appendNumber('3');
    assert.equal(calc.currentOperand, '123');

    calc.appendNumber('.');
    calc.appendNumber('5');
    calc.appendNumber('.'); // second decimal point should be ignored
    calc.appendNumber('6');
    assert.equal(calc.currentOperand, '123.56');
  });

  it('handles leading zero appropriately', () => {
    calc.appendNumber('0');
    calc.appendNumber('0');
    assert.equal(calc.currentOperand, '0');
    calc.appendNumber('7');
    assert.equal(calc.currentOperand, '7');
  });

  it('handles delete/backspace correctly', () => {
    calc.appendNumber('1');
    calc.appendNumber('2');
    calc.appendNumber('3');
    calc.delete();
    assert.equal(calc.currentOperand, '12');
    calc.delete();
    assert.equal(calc.currentOperand, '1');
    calc.delete();
    assert.equal(calc.currentOperand, '0');
  });

  it('toggles positive and negative signs', () => {
    calc.appendNumber('4');
    calc.appendNumber('2');
    calc.toggleSign();
    assert.equal(calc.currentOperand, '-42');
    calc.toggleSign();
    assert.equal(calc.currentOperand, '42');

    // Toggling zero should remain 0
    calc.clear();
    calc.toggleSign();
    assert.equal(calc.currentOperand, '0');
  });

  it('computes percentages', () => {
    calc.appendNumber('5');
    calc.appendNumber('0');
    calc.percentage();
    assert.equal(calc.currentOperand, '0.5');
  });

  it('performs basic arithmetic operations', () => {
    // 15 + 27 = 42
    calc.appendNumber('1');
    calc.appendNumber('5');
    calc.chooseOperation('+');
    calc.appendNumber('2');
    calc.appendNumber('7');
    calc.compute();
    assert.equal(calc.currentOperand, '42');
  });

  it('chains operations correctly', () => {
    // 10 + 5 * 2 = (10 + 5) = 15 * 2 = 30
    calc.appendNumber('1');
    calc.appendNumber('0');
    calc.chooseOperation('+');
    calc.appendNumber('5');
    calc.chooseOperation('×');
    assert.equal(calc.previousOperand, '15');
    calc.appendNumber('2');
    calc.compute();
    assert.equal(calc.currentOperand, '30');
  });

  it('handles division by zero gracefully', () => {
    calc.appendNumber('8');
    calc.chooseOperation('÷');
    calc.appendNumber('0');
    calc.compute();
    assert.equal(calc.isError, true);
    assert.equal(calc.currentOperand, 'Cannot divide by zero');

    // Entering a new number resets error
    calc.appendNumber('5');
    assert.equal(calc.isError, false);
    assert.equal(calc.currentOperand, '5');
  });

  it('records history of completed calculations', () => {
    calc.appendNumber('4');
    calc.chooseOperation('×');
    calc.appendNumber('5');
    calc.compute();

    assert.equal(calc.history.length, 1);
    assert.equal(calc.history[0].expression, '4 × 5');
    assert.equal(calc.history[0].result, '20');

    calc.chooseOperation('+');
    calc.appendNumber('1');
    calc.appendNumber('0');
    calc.compute();

    assert.equal(calc.history.length, 2);
    assert.equal(calc.history[0].expression, '20 + 10');
    assert.equal(calc.history[0].result, '30');
  });

  it('formats display output with commas', () => {
    calc.appendNumber('1');
    calc.appendNumber('0');
    calc.appendNumber('0');
    calc.appendNumber('0');
    calc.appendNumber('0');
    calc.appendNumber('0');
    calc.appendNumber('0');
    calc.appendNumber('.');
    calc.appendNumber('5');

    const display = calc.getDisplay();
    assert.equal(display.current, '1,000,000.5');
  });

  it('handles clear and all clear', () => {
    calc.appendNumber('9');
    calc.chooseOperation('+');
    calc.appendNumber('1');
    calc.compute();
    assert.equal(calc.history.length, 1);

    calc.clear();
    assert.equal(calc.currentOperand, '0');
    assert.equal(calc.history.length, 1); // history retained

    calc.allClear();
    assert.equal(calc.currentOperand, '0');
    assert.equal(calc.history.length, 0); // history cleared
  });
});
