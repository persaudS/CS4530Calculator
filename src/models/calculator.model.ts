import { ActionKeys } from '../enums/action-keys.enum';
import { NumericKeys } from '../enums/numeric-keys.enum';
import { OperatorKeys } from '../enums/operator-keys.enum';
import { ICalculatorModel } from '../interfaces/calculator-model.interface';

export class CalculatorModel implements ICalculatorModel {

  private _buffer: string = '';

  public pressNumericKey(key: NumericKeys): void {
    this._buffer += key;
  }

  public pressOperatorKey(key: OperatorKeys): void {
    this._buffer += key;
  }

  public pressActionKey(key: ActionKeys): void {
    if (key === ActionKeys.CLEAR) {
      this.clear();
    } else if (key === ActionKeys.EQUALS) {
      this.evaluate();
    } else if (key === ActionKeys.DOT) {
      this._buffer += '.';
    }
  }

  public display(): string {
    return this._buffer;
  }

  public clear(): void {
    this._buffer = '';
  }

  public evaluate(): number | String {

    let expression = this._buffer
    //We need to remove all unwanted characters, symbols, elements, etc.
    try {
      const cleanExpression = expression.replace(/[^-()\d/*+.]/g, '');
      if (!cleanExpression) {
        throw new Error('Invalid input');
      }
      //This regex matches digits, floating-point numbers, and mathematical operators +, -, *, /
      const tokens = cleanExpression.match(/(?:\d+\.\d+|\d+|[+\-*/()])/g);
      if (!tokens) {
        throw new Error('Invalid expression');
      }
      const valueStack: (string | number) [] = []
      const operatorStack: string[] = [];

      const operatorPrecedence = new Map<string, number>();
      operatorPrecedence.set('+', 1);
      operatorPrecedence.set('-', 1);
      operatorPrecedence.set('*', 2);
      operatorPrecedence.set('/', 2);

      console.log(tokens)
      for (let i = 0; i < tokens.length ; i++) {
        if (isNumber(tokens[i])) {
          valueStack.push(parseFloat(tokens[i]))
        }
        else if (isOperator(tokens[i])) {
          if (tokens[i] === '-' && (i === 0 || isOperator(tokens[i - 1]) || tokens[i - 1] === '(')) {
            // Handle unary minus
            const nextToken = tokens[i + 1];
            if (nextToken && isNumber(nextToken)) {
              valueStack.push(-parseFloat(nextToken));
              i++; // Skip the next token since we've handled it
            } else {
              throw new Error('Invalid unary minus usage');
            }
          } else {
            while (
              operatorStack.length &&
              hasHigherPrecedence(operatorStack[operatorStack.length - 1], tokens[i], operatorPrecedence)
            ) {
              const operator = operatorStack.pop() as string;
              const right = valueStack.pop() as number;
              const left = valueStack.pop() as number;
              valueStack.push(applyOperator(left, operator, right));
            }
            operatorStack.push(tokens[i]);
           }
          }
          else if (tokens[i] === '(') {
          operatorStack.push(tokens[i]);
        } else if (tokens[i] === ')') {
          while (operatorStack.length && operatorStack[operatorStack.length - 1] !== '(') {
            const operator = operatorStack.pop() as string;
            const right = valueStack.pop() as number;
            const left = valueStack.pop() as number;
            valueStack.push(applyOperator(left, operator, right));
          }
          if (operatorStack.length === 0 || operatorStack[operatorStack.length - 1] !== '(') {
            throw new Error('Mismatched parentheses');
          }
          operatorStack.pop() //gets rid of opening parentheses
        }
      }
      while (operatorStack.length) {
        const operator = operatorStack.pop() as string;
        const right = valueStack.pop() as number;
        const left = valueStack.pop() as number;
        let result = 0;
        result = applyOperator(left, operator, right)
        valueStack.push(result);
      }

      if (valueStack.length !== 1 || operatorStack.length !== 0) {
        throw new Error('Invalid expression, try again');
      }
      this._buffer = valueStack[0].toString();
      return valueStack[0];
    }
    catch (error) {
      return 'SYSTEM EXPLODE!';
    }
  }
}
function isNumber(token: string): boolean {
  return (/^[+\-]?\d+(\.\d+)?$/).test(token);
}

function isOperator(token: string): boolean {
  return (/^[\+\-\*/]$/).test(token);
}
type OperatorPrecedence = {
  '+': number;
  '-': number;
  '*': number;
  '/': number;
}
function hasHigherPrecedence(operator1: string, operator2: string, precedence: Map<string, number>): boolean {
  return precedence.get(operator1) >= precedence.get(operator2);
}

function applyOperator(left: number, operator: string, right: number): number {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      if (right === 0) {
        throw new Error('Division by zero');
      }
      return left / right;
    default:
      throw new Error('Invalid operator');
  }
}
