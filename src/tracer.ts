import tracer from "dd-trace"

tracer.init({
  logInjection: true,
  runtimeMetrics: true,
})

// enable and configure postgresql integration
tracer.use("pg", {
  service: `monsoon-${process.env.NODE_ENV}`,
})

tracer.use("graphql", {
  service: `monsoon-${process.env.NODE_ENV}`,
})

export default tracer
