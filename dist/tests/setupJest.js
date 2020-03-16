jest.mock("airtable", function () { return ({
    base: function () { return function () { return ({
        create: jest.fn(function (data) { return data; }),
        select: function () { return ({
            firstPage: jest.fn(function (cb) { return cb(null, []); }),
            eachPage: jest.fn(function (cb) { return cb(null, []); }),
        }); },
    }); }; },
    configure: jest.fn(),
}); });
jest.mock("chargebee");
jest.mock("@sendgrid/mail");
//# sourceMappingURL=setupJest.js.map