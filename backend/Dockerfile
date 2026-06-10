# Multi-stage build for Go backend
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o wedding-api .

# Final stage
FROM alpine:3.19

WORKDIR /app

# Install ca-certificates for HTTPS
RUN apk add --no-cache ca-certificates

# Copy binary from builder
COPY --from=builder /app/wedding-api .

# Copy migrations
COPY --from=builder /app/migrations ./migrations

# Create uploads directory
RUN mkdir -p ./uploads

# Expose port
EXPOSE 8080

# Run
CMD ["./wedding-api"]
