import { Calculator } from './calculator.js';

/**
 * Controller to connect the Calculator engine to the DOM and manage UI state.
 */
class CalculatorUI {
  constructor() {
    this.calc = new Calculator();

    // DOM Elements
    this.displayPrevious = document.getElementById('display-previous');
    this.displayCurrent = document.getElementById('display-current');
    this.themeToggleBtn = document.getElementById('theme-toggle');
    this.historyToggleBtn = document.getElementById('history-toggle');
    this.historyPanel = document.getElementById('history-panel');
    this.historyList = document.getElementById('history-list');
    this.clearHistoryBtn = document.getElementById('clear-history-btn');
    this.closeHistoryBtn = document.getElementById('close-history-btn');

    this.init();
  }

  init() {
    this.bindKeypadEvents();
    this.bindKeyboardShortcuts();
    this.bindHeaderAndHistoryEvents();
    this.updateDisplay();
  }

  /**
   * Bind clicks on calculator buttons.
   */
  bindKeypadEvents() {
    document.querySelector('.keypad').addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (!button) return;

      if (button.dataset.number != null) {
        this.calc.appendNumber(button.dataset.number);
      } else if (button.dataset.operator != null) {
        this.calc.chooseOperation(button.dataset.operator);
      } else if (button.dataset.action != null) {
        this.handleAction(button.dataset.action);
      }

      this.updateDisplay();
      this.updateHistoryUI();
    });
  }

  /**
   * Handle special action buttons (AC, DEL, %, ±, =).
   */
  handleAction(action) {
    switch (action) {
      case 'all-clear':
        this.calc.clear();
        break;
      case 'delete':
        this.calc.delete();
        break;
      case 'percent':
        this.calc.percentage();
        break;
      case 'negate':
        this.calc.toggleSign();
        break;
      case 'calculate':
        this.calc.compute();
        break;
    }
  }

  /**
   * Support physical keyboard input.
   */
  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignore if user is inside an input field if one ever exists
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
        this.calc.appendNumber(e.key);
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        e.preventDefault();
        this.calc.chooseOperation(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        this.calc.compute();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        this.calc.delete();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.calc.clear();
      } else if (e.key === '%') {
        e.preventDefault();
        this.calc.percentage();
      } else if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        this.toggleHistory();
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        this.toggleTheme();
      }

      this.updateDisplay();
      this.updateHistoryUI();
    });
  }

  /**
   * Header interactions: theme toggle, history toggle, clear history.
   */
  bindHeaderAndHistoryEvents() {
    this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    this.historyToggleBtn.addEventListener('click', () => this.toggleHistory());
    this.closeHistoryBtn.addEventListener('click', () => this.closeHistory());

    this.clearHistoryBtn.addEventListener('click', () => {
      this.calc.history = [];
      this.updateHistoryUI();
    });

    // Clicking an item in history populates current operand
    this.historyList.addEventListener('click', (e) => {
      const item = e.target.closest('.history-item');
      if (!item) return;

      const result = item.dataset.result;
      if (result) {
        this.calc.currentOperand = result;
        this.calc.shouldResetScreen = true;
        this.updateDisplay();
        this.closeHistory();
      }
    });
  }

  toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
  }

  toggleHistory() {
    this.historyPanel.classList.toggle('hidden');
  }

  closeHistory() {
    this.historyPanel.classList.add('hidden');
  }

  /**
   * Renders the current state of the calculator to the display.
   */
  updateDisplay() {
    const { previous, current, isError } = this.calc.getDisplay();
    this.displayPrevious.textContent = previous;
    this.displayCurrent.textContent = current;

    if (isError) {
      this.displayCurrent.classList.add('error-text');
    } else {
      this.displayCurrent.classList.remove('error-text');
    }
  }

  /**
   * Renders calculation history list.
   */
  updateHistoryUI() {
    if (this.calc.history.length === 0) {
      this.historyList.innerHTML = '<p class="history-empty">No calculations yet</p>';
      return;
    }

    this.historyList.innerHTML = this.calc.history.map(entry => `
      <div class="history-item" data-result="${entry.result}" title="Click to use result">
        <div class="history-item-exp">${entry.expression} =</div>
        <div class="history-item-res">${this.calc.formatNumber(entry.result)}</div>
      </div>
    `).join('');
  }
}

// Instantiate when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new CalculatorUI();
});
