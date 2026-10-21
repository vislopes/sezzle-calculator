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
    throw new Error(data.error || 'Unable to calculate.')
  }

  if (typeof data.result !== 'number' || !Number.isFinite(data.result)) {
    throw new Error('The API returned an invalid result.')
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
  const [percentageInput, setPercentageInput] = useState<string | null>(null)

  function resetCalculator() {
    setExpression('')
    setResult('0')
    setCurrentInput('')
    setFirstOperand(null)
    setPendingOperation(null)
    setStartNewNumber(false)
    setIsCalculating(false)
    setPercentageInput(null)
  }

  function enterNumber(key: string) {
    if (result.startsWith('Error:')) {
      setResult('0')
      setExpression('')
      setCurrentInput(key === '.' ? '0.' : key)
      setFirstOperand(null)
      setPendingOperation(null)
      setStartNewNumber(false)
      setPercentageInput(null)
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
      setPercentageInput(null)
      return
    }

    const newValue =
      key === '.'
        ? currentInput === ''
          ? '0.'
          : currentInput + '.'
        : currentInput === '0'
          ? key
          : currentInput + key

    setCurrentInput(newValue)
    setExpression((current) =>
      currentInput === '' && key === '.'
        ? current + '0.'
        : current + key,
    )
    setPercentageInput(null)
  }

  async function chooseOperation(key: string) {
    const operation = operationMap[key]

    if (!operation || isCalculating) return

    if (pendingOperation !== null && firstOperand !== null) {
      if (currentInput === '') {
        setPendingOperation(operation)
        setExpression(`${formatNumber(firstOperand)} ${key} `)
        setStartNewNumber(true)
        setPercentageInput(null)
        return
      }

      const secondOperand = Number(currentInput)

      if (!Number.isFinite(secondOperand)) return

      setIsCalculating(true)

      try {
        const answer = await calculateWithAPI(
          pendingOperation,
          firstOperand,
          secondOperand,
        )

        const formatted = formatNumber(answer)

        setFirstOperand(answer)
        setPendingOperation(operation)
        setCurrentInput('')
        setResult(formatted)
        setExpression(`${formatted} ${key} `)
        setStartNewNumber(true)
        setPercentageInput(null)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to calculate.'

        setResult(`Error: ${message}`)
      } finally {
        setIsCalculating(false)
      }

      return
    }

    const valueText = currentInput || result

    if (valueText.startsWith('Error:')) return

    const value = Number(valueText)

    if (!Number.isFinite(value)) return

    setFirstOperand(value)
    setPendingOperation(operation)
    setCurrentInput('')
    setExpression(`${formatNumber(value)} ${key} `)
    setStartNewNumber(true)
    setPercentageInput(null)
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

    const inputValue = Number(currentInput)
    const operation = pendingOperation
    const first = firstOperand

    if (!Number.isFinite(inputValue)) {
      setResult('Error: Invalid number')
      return
    }

    const displayedValue =
      percentageInput !== null
        ? `${percentageInput}%`
        : formatNumber(inputValue)

    const displayedExpression =
      `${formatNumber(first)} ${getOperationSymbol(operation)} ${displayedValue} =`

    setIsCalculating(true)

    try {
      const answer = await calculateWithAPI(
        operation,
        first,
        inputValue,
      )

      const formatted = formatNumber(answer)

      setExpression(displayedExpression)
      setResult(formatted)
      setCurrentInput(formatted)
      setFirstOperand(null)
      setPendingOperation(null)
      setStartNewNumber(true)
      setPercentageInput(null)
    } catch (error) {
      setResult(
        `Error: ${
          error instanceof Error
            ? error.message
            : 'Unable to calculate.'
        }`,
      )
    } finally {
      setIsCalculating(false)
    }
  }

  async function calculateSquareRoot() {
    if (isCalculating) return

    const valueText = currentInput || result

    if (valueText.startsWith('Error:')) return

    const value = Number(valueText)

    if (!Number.isFinite(value)) {
      setResult('Error: Invalid number')
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
      setPercentageInput(null)
    } catch (error) {
      setResult(
        `Error: ${
          error instanceof Error
            ? error.message
            : 'Unable to calculate.'
        }`,
      )
    } finally {
      setIsCalculating(false)
    }
  }

  function deleteLastCharacter() {
    if (isCalculating) return

    if (result.startsWith('Error:')) {
      resetCalculator()
      return
    }

    if (pendingOperation !== null && firstOperand !== null) {
      if (currentInput !== '') {
        const nextInput = currentInput.slice(0, -1)

        setCurrentInput(nextInput)
        setExpression(
          `${formatNumber(firstOperand)} ${getOperationSymbol(pendingOperation)} ${nextInput}`,
        )
        setStartNewNumber(nextInput === '')
        setPercentageInput(null)
        return
      }

      const value = formatNumber(firstOperand)

      setExpression(value)
      setCurrentInput(value)
      setResult(value)
      setFirstOperand(null)
      setPendingOperation(null)
      setStartNewNumber(false)
      setPercentageInput(null)
      return
    }

    if (startNewNumber) {
      setExpression('')
      setCurrentInput('')
      setResult('0')
      setFirstOperand(null)
      setPendingOperation(null)
      setStartNewNumber(false)
      setPercentageInput(null)
      return
    }

    const nextInput = currentInput.slice(0, -1)

    setCurrentInput(nextInput)
    setExpression(nextInput)
    setResult(nextInput || '0')
    setPercentageInput(null)
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

  function calculatePercentage() {
    if (isCalculating) return

    const valueText = currentInput || result

    if (valueText.startsWith('Error:')) return

    const value = Number(valueText)

    if (!Number.isFinite(value)) return

    if (pendingOperation !== null && firstOperand !== null) {
      setPercentageInput(formatNumber(value))

      const percentageValue =
        pendingOperation === 'multiply' || pendingOperation === 'divide'
          ? value / 100
          : (firstOperand * value) / 100

      setCurrentInput(String(percentageValue))
      setExpression(
        `${formatNumber(firstOperand)} ${getOperationSymbol(pendingOperation)} ${formatNumber(value)}%`,
      )
      setStartNewNumber(false)
      return
    }

    const percentageValue = value / 100
    const formatted = formatNumber(percentageValue)

    setCurrentInput(formatted)
    setResult(formatted)
    setExpression(`${formatNumber(value)}%`)
    setStartNewNumber(true)
    setPercentageInput(null)
  }

  function handleKey(key: string) {
    if (isCalculating) return

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

    if (key === '%') {
      calculatePercentage()
      return
    }

    if (operationMap[key]) {
      void chooseOperation(key)
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
            {isCalculating ? 'Calculating...' : result}
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