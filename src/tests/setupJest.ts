import path from "path"

import dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), ".env.testing") })
dotenv.config({ path: path.resolve(process.cwd(), ".env") })

console.log(
  process.env.PRISMA_ENDPOINT == "http://localhost:4477/monsoon/test"
    ? "true"
    : "false"
)
