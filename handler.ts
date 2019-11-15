import sgMail from "@sendgrid/mail"
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
module.exports.checkAndAuthorizeUsers = (event, context, callback) => {
    //@ts-ignore
    const msg = {
        to: "faiyam@faiyamrahman.com",
        templateId: "d-a62e1c840166432abd396d1536e4489d",
        from: { email: "membership@seasons.nyc", name: "Seasons NYC" },
        dynamic_template_data: {},
    }
    sgMail.send(msg)
    console.log("ran checkAndAUthorize users!")
};