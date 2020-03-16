"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
let FAQService = class FAQService {
    getSections() {
        return [
            {
                title: "Need to return your items?",
                subsections: [
                    {
                        title: "Ready for something new?",
                        text: "We're happy to exchange for a different size pending availability. Pack it up, attach the pre-paid shipping label and drop it off at your closest UPS or UPS pickup point.",
                    },
                    {
                        title: "Received the wrong item?",
                        text: "Sorry about that! Pack it up, attach the pre-paid shipping label and send it back. We'll get you the right one.",
                    },
                    {
                        title: "Did something not fit?",
                        text: "We're happy to help you find something that fits. Pack it up, send it back, and we'll swap it out.",
                    },
                    {
                        title: "Have feedback or thoughts?",
                        text: "Contact us below. We'd love to hear from you.",
                    },
                ],
            },
        ];
    }
};
FAQService = __decorate([
    common_1.Injectable()
], FAQService);
exports.FAQService = FAQService;
//# sourceMappingURL=faq.service.js.map