import tracer from "dd-trace"

tracer.init({
  logInjection: true,
  runtimeMetrics: process.env.NODE_ENV === "production",
})

export default tracer
