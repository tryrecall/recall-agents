# @steelengine/diagnostics-prometheus

Official Prometheus diagnostics exporter for SteelEngine.

This plugin exposes SteelEngine Gateway runtime metrics in Prometheus text format for Prometheus, Grafana, VictoriaMetrics, and compatible scrapers.

## Install

```bash
steelengine plugins install @steelengine/diagnostics-prometheus
```

Restart the Gateway after installing or updating the plugin.

## Configure

Enable the plugin and set the scrape endpoint options in `plugins.entries.diagnostics-prometheus.config`.

The full config surface, metric names, and scrape examples live in the docs:

- https://docs.steelengine.ai/gateway/prometheus

## Package

- Plugin id: `diagnostics-prometheus`
- Package: `@steelengine/diagnostics-prometheus`
- Minimum SteelEngine host: `2026.4.25`
