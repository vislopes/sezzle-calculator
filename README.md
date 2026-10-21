# QuartzCalculator

A full-stack calculator application built with React, TypeScript, and Go. The React frontend communicates with a Go REST API to perform basic and advanced arithmetic operations.

## Features

- Addition, subtraction, multiplication, and division.
- Exponentiation, square root, and percentage calculations.
- Input validation and error handling.
- Responsive calculator interface.
- REST API with JSON request and response formats.
- Frontend and backend unit tests.
- Backend test coverage report.

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Vitest
- React Testing Library

**Backend**
- Go
- REST API
- JSON

## Project Structure

```text
sezzle-calculator/
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.test.tsx
│   │   └── setupTests.ts
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── main.go
│   ├── calculator.go
│   ├── main_test.go
│   ├── calculator_test.go
│   ├── go.mod
│   ├── coverage.out
│   └── coverage.txt
├── AI_PROMPTS.md
└── README.md
```

## Prerequisites

- Node.js and npm
- Go

## Getting Started

### 1. Start the backend

Open a terminal from the project root and run:

```bash
cd backend
go run .
```

The API will be available at `http://localhost:8080`.

### 2. Start the frontend

Open a second terminal from the project root and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## API Documentation

The backend exposes a REST API for calculator operations.

### Health Check

**Endpoint:** `GET /health`

Example:

```bash
curl http://localhost:8080/health
```

### Calculate

**Endpoint:** `POST /calculate`

Send a JSON request containing the operation and its operands.

**Request example:**

```json
{
  "operation": "add",
  "a": 5,
  "b": 3
}
```

**Successful response:**

```json
{
  "result": 8
}
```

**Example request using curl:**

```bash
curl -X POST http://localhost:8080/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"add","a":5,"b":3}'
```

### Supported Operations

| Operation | Description | Example |
|---|---|---|
| `add` | Addition | 5 + 3 = 8 |
| `subtract` | Subtraction | 5 - 3 = 2 |
| `multiply` | Multiplication | 5 × 3 = 15 |
| `divide` | Division | 6 ÷ 3 = 2 |
| `power` | Exponentiation | 2³ = 8 |
| `sqrt` | Square root | √9 = 3 |
| `percentage` | Calculates a percentage of a value | 20% of 200 = 40 |

For `sqrt`, provide the number in `a`. For `percentage`, `a` is the base value and `b` is the percentage.

**Square root example:**

```json
{
  "operation": "sqrt",
  "a": 9
}
```

**Percentage example:**

```json
{
  "operation": "percentage",
  "a": 200,
  "b": 20
}
```

The API validates requests and handles invalid input, unsupported operations, division by zero, and square roots of negative numbers by returning error responses.

## Testing

### Frontend Tests

From the project root:

```bash
cd frontend
npm test
```

The frontend tests verify calculator component behavior, including calculation results and error handling. API responses are mocked in component tests.

### Frontend Production Build

```bash
cd frontend
npm run build
```

### Backend Tests

From the project root:

```bash
cd backend
go test ./...
```

### Backend Coverage Report

Generate the coverage profile and display function-level coverage:

```bash
cd backend
go test -coverprofile=coverage.out ./...
go tool cover -func=coverage.out
```

The current backend test report shows **82.3% statement coverage**.

The generated coverage profile is saved in `backend/coverage.out`, and the text report is available in `backend/coverage.txt`.

## Design Decisions

- **Separation of concerns:** The frontend handles the user interface, while the backend centralizes arithmetic logic and input validation.
- **REST API:** The frontend communicates with the backend through HTTP requests, keeping calculation logic independent of the presentation layer.
- **JSON communication:** JSON provides a straightforward format for calculator requests and responses.
- **Input validation:** The backend handles invalid operations and mathematical edge cases, including division by zero and negative square roots.
- **Testability:** Frontend component tests and backend unit tests help verify expected behavior and error handling.
- **Maintainability:** React with TypeScript and Go provide clear structures for organizing and maintaining the application.

## AI Assistance

AI tools were used occasionally as a supplementary reference during development to clarify specific implementation details, explore edge cases, get suggestions for tests, and understand test coverage reporting.

The application was implemented and tested locally. The specific areas where AI assistance was used are documented in [`AI_PROMPTS.md`](AI_PROMPTS.md).
