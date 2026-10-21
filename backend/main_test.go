package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCalculateHandler(t *testing.T) {
	tests := []struct {
		name       string
		method     string
		body       string
		wantStatus int
		wantResult float64
		wantError  string
	}{
		{
			name:       "addition",
			method:     http.MethodPost,
			body:       `{"operation":"add","a":5,"b":3}`,
			wantStatus: http.StatusOK,
			wantResult: 8,
		},
		{
			name:       "square root",
			method:     http.MethodPost,
			body:       `{"operation":"sqrt","a":9}`,
			wantStatus: http.StatusOK,
			wantResult: 3,
		},
		{
			name:       "division by zero",
			method:     http.MethodPost,
			body:       `{"operation":"divide","a":5,"b":0}`,
			wantStatus: http.StatusBadRequest,
			wantError:  "division by zero",
		},
		{
			name:       "missing operand",
			method:     http.MethodPost,
			body:       `{"operation":"add","a":5}`,
			wantStatus: http.StatusBadRequest,
			wantError:  "operand b is required",
		},
		{
			name:       "invalid JSON",
			method:     http.MethodPost,
			body:       `not-json`,
			wantStatus: http.StatusBadRequest,
			wantError:  "invalid JSON",
		},
		{
			name:       "unsupported method",
			method:     http.MethodGet,
			body:       "",
			wantStatus: http.StatusMethodNotAllowed,
			wantError:  "method not allowed",
		},
		{
			name:       "unknown operation",
			method:     http.MethodPost,
			body:       `{"operation":"unknown","a":1,"b":2}`,
			wantStatus: http.StatusBadRequest,
			wantError:  "unsupported operation",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(
				tt.method,
				"/calculate",
				strings.NewReader(tt.body),
			)
			req.Header.Set("Content-Type", "application/json")

			recorder := httptest.NewRecorder()
			calculateHandler(recorder, req)

			if recorder.Code != tt.wantStatus {
				t.Fatalf(
					"status = %d, want %d; body: %s",
					recorder.Code,
					tt.wantStatus,
					recorder.Body.String(),
				)
			}

			if tt.wantStatus == http.StatusOK {
				var response CalculateResponse
				if err := json.Unmarshal(
					recorder.Body.Bytes(),
					&response,
				); err != nil {
					t.Fatalf("invalid JSON response: %v", err)
				}

				if response.Result != tt.wantResult {
					t.Errorf(
						"result = %v, want %v",
						response.Result,
						tt.wantResult,
					)
				}
			} else {
				var response ErrorResponse
				if err := json.Unmarshal(
					recorder.Body.Bytes(),
					&response,
				); err != nil {
					t.Fatalf("invalid error response: %v", err)
				}

				if !strings.Contains(
					response.Error,
					tt.wantError,
				) {
					t.Errorf(
						"error = %q, want it to contain %q",
						response.Error,
						tt.wantError,
					)
				}
			}
		})
	}
}

func TestCalculateHandlerOptions(t *testing.T) {
	req := httptest.NewRequest(
		http.MethodOptions,
		"/calculate",
		nil,
	)
	recorder := httptest.NewRecorder()

	calculateHandler(recorder, req)

	if recorder.Code != http.StatusNoContent {
		t.Errorf(
			"status = %d, want %d",
			recorder.Code,
			http.StatusNoContent,
		)
	}

	if got := recorder.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:5173" {
		t.Errorf("unexpected CORS origin: %q", got)
	}
}
