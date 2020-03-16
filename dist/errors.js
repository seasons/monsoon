"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SyncError extends Error {
    constructor(message) {
        super(message);
        this.name = "SyncError";
    }
}
exports.SyncError = SyncError;
class RollbackError extends Error {
    constructor(message) {
        super(message);
        this.name = "RollbackError";
    }
}
exports.RollbackError = RollbackError;
//# sourceMappingURL=errors.js.map