export class SyncError extends Error {
  constructor(message) {
    super(message)
    this.name = "SyncError"
  }
}
