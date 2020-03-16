"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var SyncError = /** @class */ (function (_super) {
    __extends(SyncError, _super);
    function SyncError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "SyncError";
        return _this;
    }
    return SyncError;
}(Error));
exports.SyncError = SyncError;
var RollbackError = /** @class */ (function (_super) {
    __extends(RollbackError, _super);
    function RollbackError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "RollbackError";
        return _this;
    }
    return RollbackError;
}(Error));
exports.RollbackError = RollbackError;
//# sourceMappingURL=errors.js.map