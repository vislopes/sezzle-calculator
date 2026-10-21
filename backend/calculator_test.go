package main

import (
	"math"
	"testing"
)

func TestCalculate(t *testing.T) {
	tests := []struct {
		name      string
		operation string
		a         float64
		b         float64
		want      float64
		wantError bool
	}{
		{"addition", "add", 5, 3, 8, false},
		{"subtraction", "subtract", 5, 3, 2, false},
		{"multiplication", "multiply", 5, 3, 15, false},
		{"division", "divide", 6, 3, 2, false},
		{"power", "power", 2, 3, 8, false},
		{"square root", "sqrt", 9, 0, 3, false},
		{"percentage", "percentage", 200, 20, 40, false},
		{"division by zero", "divide", 5, 0, 0, true},
		{"negative square root", "sqrt", -9, 0, 0, true},
		{"unknown operation", "unknown", 1, 2, 0, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := calculate(tt.operation, tt.a, tt.b)

			if tt.wantError {
				if err == nil {
					t.Fatal("expected an error, got nil")
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if math.Abs(got-tt.want) > 1e-9 {
				t.Errorf("got %v, want %v", got, tt.want)
			}
		})
	}
}
