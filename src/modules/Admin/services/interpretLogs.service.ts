import { AdminActionLog } from "@app/prisma/prisma.binding"
import { Injectable } from "@nestjs/common"
import { omit } from "lodash"

@Injectable()
export class InterpretLogsService {
  interpretReservationLogs(logs: AdminActionLog[]) {
    // for now, just filter these out of the changed logs
    const keysWeDontCareAbout = [
      "receipt",
      "id",
      "sentPackage",
      "returnedPackage",
    ]

    return logs
      .map(a => {
        const filteredLog = { ...a }
        filteredLog.changedFields = omit(a.changedFields, keysWeDontCareAbout)
        return filteredLog
      })
      .filter(b => {
        if (
          b.action === "Update" &&
          Object.keys(b.changedFields).length === 0
        ) {
          return false
        }
        return true
      })
  }
}
