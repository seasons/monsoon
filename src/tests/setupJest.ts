import path from "path"

import dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

process.env.PRISMA_ENDPOINT = "http://localhost:4466"
