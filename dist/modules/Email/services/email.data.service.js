"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
let EmailDataProvider = class EmailDataProvider {
    reservationReturnConfirmation(reservationNumber, itemsReturned, userEmail) {
        return {
            email: {
                subject: `Reservation #${reservationNumber} return processed`,
                body: {
                    paragraphs: [
                        {
                            html: `Items returned: ${itemsReturned}<br></br>User: ${userEmail}`,
                        },
                        {
                            html: `Please confirm that the reservation was processed as expected. ` +
                                `If anything looks wrong, please alert a developer.`,
                        },
                    ],
                },
            },
        };
    }
    reservationConfirmation(reservationNumber, reservedItems, returnDateFormatted) {
        return {
            email: {
                body: {
                    paragraphs: [
                        {
                            html: "Sit back, relax and we'll let you know when it's on its way.",
                        },
                    ],
                },
                prefooter: {
                    paragraphs: [
                        {
                            html: `Please return your items no later than ${returnDateFormatted}.`,
                        },
                        { html: `Here's what you'll need to do:` },
                        {
                            html: `<ol style="margin:0px"><li>Place the items you’re returning into your bag - hangers included!</li>` +
                                `<li>Insert the return shipping label into the pouch on the outside of the bag.</li>` +
                                `<li>Drop off at your closest UPS pick up location.</li></ol>`,
                        },
                        {
                            html: "Once we’ve received and processed your items, we’ll send you an email " +
                                "confirmation and your bag will be reset for you to place your next order!" +
                                " This typically takes about 2-3 business days.",
                        },
                        {
                            html: `If you have any questions, reach out to ${process.env.MAIN_CONTACT_EMAIL}`,
                        },
                    ],
                },
                title: "We've got your order",
                reservedItems,
                subject: `Order #${reservationNumber} | Your Reservation is Confirmed`,
            },
        };
    }
    completeAccount(firstName, url) {
        return {
            email: {
                body: {
                    paragraphs: [
                        {
                            html: `Hey ${firstName}, thanks for waiting. We're ready for you. ` +
                                `Tap the button below to choose your membership plan, get the beta app and start reserving.`,
                        },
                        {
                            html: `Heads up -- due to demand, we may need to give your spot to someone` +
                                ` else if you don't choose your plan within the next 48 hours.`,
                        },
                        { html: "Thanks,<br>The Seasons Team" },
                    ],
                    button: { text: "Choose plan", url },
                },
                prefooter: {
                    paragraphs: [
                        {
                            html: `If you have any questions, reach out to ${process.env.MAIN_CONTACT_EMAIL}.`,
                        },
                    ],
                },
                title: "You're in. Let's choose your plan",
                subject: "You're in. Let's choose your plan",
            },
        };
    }
    freeToReserve() {
        return {
            email: {
                body: {
                    paragraphs: [
                        {
                            html: `Good news! Your items made it back to Seasons HQ and we've reset your bag.` +
                                ` You can now place a new reservation`,
                        },
                        {
                            html: "If you have any questions, feel free to reply to this e-mail.",
                        },
                    ],
                },
                title: "We've got your order",
                subject: "We've received your return",
            },
        };
    }
    welcomeToSeasons(firstName) {
        return {
            email: {
                body: {
                    paragraphs: [
                        {
                            html: `Hey ${firstName}, thank you so much for signing up. We're excited ` +
                                `you're here. As a Founding Member, you'll be the first to know about` +
                                ` exclusive features, products and restocks.`,
                        },
                        {
                            html: `We're still actively working on the beta app. If you have any ideas` +
                                ` or thoughts about the service, give us your feedback! Good or bad.` +
                                ` Just write to ${process.env.MAIN_CONTACT_EMAIL}`,
                        },
                        {
                            html: '<b style="color:#000000">How to install the app and reserve your first three pieces</b>',
                        },
                        {
                            html: `<ol><li>View this e-mail on your iOS device.</li><li>If you don\'t` +
                                ` already have it, download the <a href="${process.env.TESTFLIGHT_URL}">testflight app</a>.` +
                                `</li><li><a href="${process.env.TESTFLIGHT_URL}">Click here</a> to install` +
                                ` the seasons app on testflight.</li><li>Login and start reserving!</li></ol>`,
                        },
                    ],
                },
                title: "Welcome to Seasons.",
                subject: "Welcome to Seasons",
            },
        };
    }
    returnReminder({ name, returnDate }) {
        return {
            email: {
                body: {
                    paragraphs: [
                        { html: `Hey ${name}!<br><br>It's time to return your items.` },
                        {
                            html: `Please <b>drop off</b> your bag no later than <b>${returnDate}</b>. Once we've received and processed your items, we'll send you an email confirmation and your bag will be reset for you to place your next order! This typically takes about 2-3 business days.`,
                        },
                        { html: `As a reminder, here's what you need to do:` },
                        {
                            html: `<ol style="margin:0px"><li>Place the items you’re returning into your bag - hangers included!</li>` +
                                `<li>Insert the return shipping label into the pouch on the outside of the bag.</li>` +
                                `<li>Drop off at your closest UPS pick up location.</li></ol>`,
                        },
                        { html: "Thanks,<br>The Seasons Team" },
                    ],
                },
                prefooter: {
                    paragraphs: [
                        {
                            html: `If you have any questions, reach out to ${process.env.MAIN_CONTACT_EMAIL}.`,
                        },
                    ],
                },
                title: "It's time to return your items",
                subject: "It's time to return your items",
            },
        };
    }
};
EmailDataProvider = __decorate([
    common_1.Injectable()
], EmailDataProvider);
exports.EmailDataProvider = EmailDataProvider;
//# sourceMappingURL=email.data.service.js.map