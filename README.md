# Modern Calculator Application

A well-structured, modular, and responsive calculator web application built with vanilla JavaScript, modern CSS, and HTML5.

## Architecture & Code Structure

The project follows a clean separation of concerns:

- `src/calculator.js`: Pure mathematical utilities and the stateful `Calculator` core engine:
  - Floating point precision handling (`roundToPrecision`).
  - Arithmetic operations: Addition, Subtraction, Multiplication, Division.
  - Advanced operations: Percentage (`%`), Sign Inversion (`±`), Backspace (`DEL`), Clear (`AC`).
  - Division-by-zero detection and friendly error state handling.
  - Operation chaining and calculation history tracking.
- `src/app.js`: UI controller binding the calculator core engine to DOM elements, keyboard shortcuts, and history display.
- `src/style.css`: Modern styling with CSS custom properties (variables), light/dark themes, responsive layouts, active touch/hover states, and accessibility focus indicators.
- `index.html`: Accessible semantic HTML structure with ARIA attributes and keyboard shortcuts.
- `test/calculator.test.js`: Comprehensive automated unit tests using Node.js's built-in test runner (`node --test`).

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `0` - `9` | Enter numbers |
| `.` | Decimal point |
| `+`, `-`, `*`, `/` | Arithmetic operations |
| `Enter` or `=` | Calculate result |
| `Backspace` | Delete last digit |
| `Escape` | Clear current calculation (AC) |
| `%` | Percentage |
| `T` | Toggle Light / Dark theme |
| `H` | Open / Close calculation history |

## Getting Started

### Run Tests
```bash
npm test
```

### Run Locally
Start a local static server:
```bash
npm start
```
Then visit `http://localhost:8080` in your web browser.
