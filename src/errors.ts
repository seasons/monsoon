export class RollbackError extends Error {
  constructor (message) {
    super(message)
    this.name = "RollbackError"
  }
}
