import tracer from "dd-trace"

tracer.init({
  logInjection: true,
  runtimeMetrics: process.env.NODE_ENV !== "development",
  startupLogs: process.env.NODE_ENV !== "development",
  enabled: process.env.NODE_ENV !== "development",
})

export default tracer
