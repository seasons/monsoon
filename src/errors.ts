export class SyncError extends Error {
  constructor (message) {
    super(message)
    this.name = "SyncError"
  }
}

export class RollbackError extends Error {
  constructor (message) {
    super(message)
    this.name = "RollbackError"
  }
}
