
# QuartzCalculator

A full-stack calculator application built with React, TypeScript, and Go. The frontend communicates with a REST API backend to perform arithmetic operations.

## Features

- Addition, subtraction, multiplication, and division.
- Square root and percentage calculations.
- Power operation supported by the backend API.
- Input validation and error handling.
- Responsive calculator interface.
- Unit tests for frontend and backend.
- JSON-based REST API.

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
│   └── go.mod
└── README.md
```

## Prerequisites

- Node.js and npm
- Go

## Getting Started

### 1. Start the backend

Open a terminal:

```bash
cd backend
go run .
```

The API will run at `http://localhost:8080`.

### 2. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## API Documentation

### Health Check

`GET /health`

Example:

```bash
curl http://localhost:8080/health
```

### Calculate

`POST /calculate`

Request body:

```json
{
  "operation": "add",
  "a": 5,
  "b": 3
}
```

Successful response:

```json
{
  "result": 8
}
```

Example using curl:

```bash
curl -X POST http://localhost:8080/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"add","a":5,"b":3}'
```

Supported operations:

| Operation | Description |
|---|---|
| `add` | Addition |
| `subtract` | Subtraction |
| `multiply` | Multiplication |
| `divide` | Division |
| `power` | Exponentiation |
| `sqrt` | Square root |
| `percentage` | Calculates a percentage |

For `sqrt`, provide the number in `a`. For `percentage`, `a` is the base value and `b` is the percentage. For example, 20% of 200 is 40.

Invalid input, unsupported operations, negative square roots, and division by zero return an error response.

## Testing

### Frontend tests

```bash
cd frontend
npm test
npm run build
```

The frontend tests cover API integration behavior for addition, square root, and division-by-zero error handling. API requests are mocked in component tests.

### Backend tests

```bash
cd backend
go test ./...
```

### Backend coverage report

Generate a coverage report:

```bash
go test -coverprofile=coverage.out ./...
go tool cover -func=coverage.out
```

The backend achieved **82.3% statement coverage** in the current test run.

## Design Decisions

- The frontend and backend are separated to keep presentation and calculation logic independent.
- The frontend uses a REST API rather than implementing arithmetic operations entirely in the browser.
- The backend centralizes arithmetic logic and validates invalid inputs and edge cases.
- JSON provides a simple and consistent request/response format.
- Automated tests cover core calculation behavior and API error handling.
- The interface prioritizes a straightforward calculator workflow and responsive presentation.

## AI Assistance

AI tools were used during development to assist with implementation planning, code generation, debugging, test creation, and documentation. The resulting application was built and tested locally, with frontend build checks and backend test coverage verified.

