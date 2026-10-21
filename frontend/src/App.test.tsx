
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from './App'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function mockFetch(result: object, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => result,
  })

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function pressKeys(keys: string[]) {
  for (const key of keys) {
    fireEvent.click(screen.getByRole('button', { name: key }))
  }
}

describe('Calculator', () => {
  it('calculates addition using the API', async () => {
    const fetchMock = mockFetch({ result: 8 })

    render(<App />)
    pressKeys(['5', '+', '3', '='])

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
    })

    const request = JSON.parse(fetchMock.mock.calls[0][1].body)

    expect(request.operation).toBe('add')
    expect(request.a).toBe(5)
    expect(request.b).toBe(3)
  })

  it('calculates square root using the API', async () => {
    const fetchMock = mockFetch({ result: 3 })

    render(<App />)
    pressKeys(['9', '√'])

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
    })

    const request = JSON.parse(fetchMock.mock.calls[0][1].body)

    expect(request.operation).toBe('sqrt')
    expect(request.a).toBe(9)
  })

  it('displays an error when dividing by zero', async () => {
    mockFetch(
      { error: 'division by zero is not allowed' },
      false,
    )

    render(<App />)
    pressKeys(['5', '÷', '0', '='])

    expect(
      await screen.findByText(/division by zero/i),
    ).toBeInTheDocument()
  })
})
