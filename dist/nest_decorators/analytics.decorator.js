"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
exports.Analytics = common_1.createParamDecorator((data, [root, args, ctx, info]) => {
    return ctx.analytics;
});
//# sourceMappingURL=analytics.decorator.js.map