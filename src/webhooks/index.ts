import express from "express"

import { webflowEvents } from "./hooks/webflowEvents"

const app = express()
app.post("/webflow_events", webflowEvents)
export { app }
