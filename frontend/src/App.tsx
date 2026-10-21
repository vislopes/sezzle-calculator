
import { useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:8080/calculate'

const keys = [
  'AC', 'DEL', '%', '÷',
  '7', '8', '9', '×',
  '4', '5', '6', '−',
  '1', '2', '3', '+',
  '√', '0', '.', '=',
]

type Operation =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'percentage'
  | 'sqrt'

type ApiResponse = {
  result?: number
  error?: string
}

const operationMap: Record<string, Operation> = {
  '+': 'add',
  '−': 'subtract',
  '×': 'multiply',
  '÷': 'divide',
  '%': 'percentage',
}

async function calculateWithAPI(
  operation: Operation,
  a: number,
  b?: number,
): Promise<number> {
  const body: { operation: Operation; a: number; b?: number } = {
    operation,
    a,
  }

  if (b !== undefined) {
    body.b = b
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data: ApiResponse = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Não foi possível calcular.')
  }

  if (typeof data.result !== 'number' || !Number.isFinite(data.result)) {
    throw new Error('A API retornou um resultado inválido.')
  }

  return data.result
}

function formatNumber(value: number): string {
  return String(Number(value.toPrecision(12)))
}

function App() {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState('0')
  const [currentInput, setCurrentInput] = useState('')
  const [firstOperand, setFirstOperand] = useState<number | null>(null)
  const [pendingOperation, setPendingOperation] =
    useState<Operation | null>(null)
  const [startNewNumber, setStartNewNumber] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  function resetCalculator() {
    setExpression('')
    setResult('0')
    setCurrentInput('')
    setFirstOperand(null)
    setPendingOperation(null)
    setStartNewNumber(false)
    setIsCalculating(false)
  }

  function enterNumber(key: string) {
    const hasError = result.startsWith('Erro:')

    if (hasError) {
      setExpression(key === '.' ? '0.' : key)
      setCurrentInput(key === '.' ? '0.' : key)
      setResult('0')
      setFirstOperand(null)
      setPendingOperation(null)
      setStartNewNumber(false)
      return
    }

    if (key === '.' && !startNewNumber && currentInput.includes('.')) {
      return
    }

    if (startNewNumber) {
      const newValue = key === '.' ? '0.' : key

      setCurrentInput(newValue)
      setExpression((current) =>
        pendingOperation === null ? newValue : current + newValue,
      )
      setStartNewNumber(false)
      return
    }

    const newValue =
      key === '.'
        ? currentInput + '.'
        : currentInput === '0'
          ? key
          : currentInput + key

    setCurrentInput(newValue)
    setExpression((current) => current + key)
  }

  function chooseOperation(key: string) {
    const operation = operationMap[key]

    if (!operation || isCalculating) {
      return
    }

    const valueText = currentInput || result

    if (valueText.startsWith('Erro:')) {
      return
    }

    const value = Number(valueText)

    if (!Number.isFinite(value)) {
      return
    }

    setFirstOperand(value)
    setPendingOperation(operation)
    setCurrentInput('')
    setExpression(`${formatNumber(value)} ${key} `)
    setStartNewNumber(true)
  }

  async function calculateResult() {
    if (
      isCalculating ||
      pendingOperation === null ||
      firstOperand === null ||
      currentInput === ''
    ) {
      return
    }

    const secondOperand = Number(currentInput)
    const operation = pendingOperation
    const first = firstOperand
    const displayedExpression =
      `${formatNumber(first)} ${getOperationSymbol(operation)} ${currentInput} =`

    if (!Number.isFinite(secondOperand)) {
      setResult('Erro: número inválido')
      return
    }

    setIsCalculating(true)

    try {
      const answer = await calculateWithAPI(
        operation,
        first,
        secondOperand,
      )
      const formatted = formatNumber(answer)

      setExpression(displayedExpression)
      setResult(formatted)
      setCurrentInput(formatted)
      setFirstOperand(null)
      setPendingOperation(null)
      setStartNewNumber(true)
    } catch (error) {
      setResult(
        `Erro: ${
          error instanceof Error
            ? error.message
            : 'Não foi possível calcular.'
        }`,
      )
    } finally {
      setIsCalculating(false)
    }
  }

  async function calculateSquareRoot() {
    if (isCalculating) {
      return
    }

    const valueText = currentInput || result

    if (valueText.startsWith('Erro:')) {
      return
    }

    const value = Number(valueText)

    if (!Number.isFinite(value)) {
      setResult('Erro: número inválido')
      return
    }

    setIsCalculating(true)
    setExpression(`√(${formatNumber(value)})`)

    try {
      const answer = await calculateWithAPI('sqrt', value)
      const formatted = formatNumber(answer)

      setResult(formatted)
      setCurrentInput(formatted)
      setFirstOperand(null)
      setPendingOperation(null)
      setStartNewNumber(true)
    } catch (error) {
      setResult(
        `Erro: ${
          error instanceof Error
            ? error.message
            : 'Não foi possível calcular.'
        }`,
      )
    } finally {
      setIsCalculating(false)
    }
  }

  function deleteLastCharacter() {
    if (isCalculating) {
      return
    }

    if (result.startsWith('Erro:')) {
      setResult('0')
      setExpression('')
      setCurrentInput('')
      setStartNewNumber(false)
      return
    }

    if (startNewNumber && pendingOperation === null) {
      setExpression('')
      setCurrentInput('')
      setResult('0')
      setStartNewNumber(false)
      return
    }

    setExpression((current) => current.slice(0, -1))
    setCurrentInput((current) => current.slice(0, -1))
  }

  function getOperationSymbol(operation: Operation): string {
    const symbols: Record<Operation, string> = {
      add: '+',
      subtract: '−',
      multiply: '×',
      divide: '÷',
      percentage: '%',
      sqrt: '√',
    }

    return symbols[operation]
  }

  function handleKey(key: string) {
    if (isCalculating) {
      return
    }

    if (key === 'AC') {
      resetCalculator()
      return
    }

    if (key === 'DEL') {
      deleteLastCharacter()
      return
    }

    if (key === '=') {
      void calculateResult()
      return
    }

    if (key === '√') {
      void calculateSquareRoot()
      return
    }

    if (/^\d$/.test(key) || key === '.') {
      enterNumber(key)
      return
    }

    if (operationMap[key]) {
      chooseOperation(key)
    }
  }

  return (
    <main className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-icon">✳</span>
          <span>QuartzCalculator</span>
        </div>
        <span className="version">CALCULATOR</span>
      </header>

      <section className="calculator">
        <div className="display">
          <span className="display-label">EXPRESSION</span>
          <div className="expression">
            {expression || '0'}
          </div>
          <div className="result">
            {isCalculating ? 'Calculando...' : result}
          </div>
        </div>

        <div className="keypad">
          {keys.map((key) => (
            <button
              key={key}
              className={[
                'key',
                ['AC', 'DEL'].includes(key) ? 'key-danger' : '',
                ['÷', '×', '−', '+', '%', '√'].includes(key)
                  ? 'key-operator'
                  : '',
                key === '=' ? 'key-equals' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleKey(key)}
              type="button"
              disabled={isCalculating}
            >
              {key}
            </button>
          ))}
        </div>

        <p className="calculator-footer">
          SIMPLE · FAST · PRECISE
        </p>
      </section>

      <footer className="footer">
        Built with React, TypeScript &amp; Go
      </footer>
    </main>
  )
}

export default App
