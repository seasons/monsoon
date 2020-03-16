"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const syncReservationStatus_1 = require("./syncReservationStatus");
const syncPhysicalProductStatus_1 = require("./syncPhysicalProductStatus");
/*
Syncing reservation status requires that we first sync physical product status.
*/
function syncPhysicalProductAndReservationStatus(event, context, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const physProdReport = yield syncPhysicalProductStatus_1.syncPhysicalProductStatus();
        const reservationReport = yield syncReservationStatus_1.syncReservationStatus();
        const allErrors = [...physProdReport.errors, ...reservationReport.errors];
        console.log(Object.assign(Object.assign(Object.assign({}, physProdReport), reservationReport), { errors: allErrors }));
        return Object.assign(Object.assign(Object.assign({}, physProdReport), reservationReport), { errors: allErrors });
    });
}
exports.syncPhysicalProductAndReservationStatus = syncPhysicalProductAndReservationStatus;
//# sourceMappingURL=syncPhysicalProductAndReservationStatus.js.map