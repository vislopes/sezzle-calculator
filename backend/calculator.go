package main

import (
	"errors"
	"math"
)

func calculate(operation string, a, b float64) (float64, error) {
	var result float64

	switch operation {
	case "add":
		result = a + b

	case "subtract":
		result = a - b

	case "multiply":
		result = a * b

	case "divide":
		if b == 0 {
			return 0, errors.New("division by zero is not allowed")
		}
		result = a / b

	case "power":
		result = math.Pow(a, b)

	case "sqrt":
		if a < 0 {
			return 0, errors.New("cannot calculate square root of a negative number")
		}
		result = math.Sqrt(a)

	case "percentage":
		result = a * b / 100

	default:
		return 0, errors.New("unsupported operation")
	}

	if math.IsNaN(result) || math.IsInf(result, 0) {
		return 0, errors.New("result is outside the supported numeric range")
	}

	return result, nil
}
