package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"
)

type CalculateRequest struct {
	Operation string   `json:"operation"`
	A         *float64 `json:"a"`
	B         *float64 `json:"b"`
}

type CalculateResponse struct {
	Result float64 `json:"result"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func calculateHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, ErrorResponse{
			Error: "method not allowed",
		})
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)

	var request CalculateRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&request); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{
			Error: "invalid JSON request",
		})
		return
	}

	var extra any
	if err := decoder.Decode(&extra); err != io.EOF {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{
			Error: "request must contain a single JSON object",
		})
		return
	}

	if request.A == nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{
			Error: "operand a is required",
		})
		return
	}

	operation := strings.TrimSpace(request.Operation)
	needsB := operation != "sqrt"

	if needsB && request.B == nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{
			Error: "operand b is required for this operation",
		})
		return
	}

	b := 0.0
	if request.B != nil {
		b = *request.B
	}

	result, err := calculate(operation, *request.A, b)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{
			Error: err.Error(),
		})
		return
	}

	writeJSON(w, http.StatusOK, CalculateResponse{
		Result: result,
	})
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{
			"status": "ok",
		})
	})

	mux.HandleFunc("/calculate", calculateHandler)

	log.Println("QuartzCalculator API running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
