# How to Run

Follow these steps to set up and run the OpenTelemetry Collector with ClickHouse exporter:

1. Clone the `clickExport` repository:
    ```bash
    git clone https://github.com/siAyush/clickExport
    ```
2. Navigate into the `clickExport` directory:
    ```bash
    cd clickExport
    ```
3. Clone the OpenTelemetry Collector repository (your fork with ClickHouse DB exporter):
    ```bash
    git clone https://github.com/siAyush/opentelemetry-collector
    ```
4. Navigate into the OpenTelemetry Collector directory:
    ```bash
    cd opentelemetry-collector
    ```
5. Build the custom exporter using the provided configuration:
    ```bash
    ./ocb --config builder-config.yaml
    ```
6. Run the OpenTelemetry Collector with the custom ClickHouse exporter:
    ```bash
    ./otel-collector-with-clickhouse --config ../config.yaml
    ```

7. Generate load and export metrics:
    ```bash
    GOBIN=${GOBIN:-$(go env GOPATH)/bin}
    $GOBIN/telemetrygen metrics --duration 5s --otlp-insecure
    ```
