import express from "express"

import { chargebeeEvents } from "./hooks/chargebeeEvents"
import { webflowEvents } from "./hooks/webflowEvents"

const app = express()

app.post("/chargebee_events", chargebeeEvents)
app.post("/webflow_events", webflowEvents)

export { app }
