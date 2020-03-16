"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
exports.User = common_1.createParamDecorator((data, [root, args, ctx, info]) => {
    if (!ctx.req.user)
        return null;
    return ctx.req.user;
});
//# sourceMappingURL=user.decorator.js.map