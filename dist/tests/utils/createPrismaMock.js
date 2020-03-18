"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var mocks_1 = require("../mocks");
exports.createPrismaMock = function (_a) {
    var user = _a.user;
    return {
        user: jest.fn(function () { return user || mocks_1.userMock; }),
        customer: jest.fn(function () { return (__assign(__assign({}, mocks_1.customerMock), { detail: jest.fn(function () { return mocks_1.detailsMock; }) })); }),
        customers: jest.fn(function () { return [mocks_1.customerMock]; }),
        updateCustomerDetail: jest.fn(function () { return Promise.resolve(); }),
        updateCustomer: jest.fn(function () { return Promise.resolve(); }),
        $exists: {
            user: jest.fn(function () { return true; }),
        },
    };
};
//# sourceMappingURL=createPrismaMock.js.map