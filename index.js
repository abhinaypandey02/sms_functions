const functions = require("firebase-functions");
const Vonage = require('@vonage/server-sdk')
const cors = require('cors')({ origin: "*" });
const vonage = new Vonage({
    apiKey: "835c5b00",
    apiSecret: "KeNqACxZaJlpZ5Je"
})
exports.sendMessage = functions.https.onRequest(async (req, res) => {
    cors(req, res, () => {
        const { to, text, from } = req.body;
        if (!to || !text ||!from) {
            res.sendStatus(400);
            return;
        }
        const failed = []
        let count = 0;
        to.forEach(phone => {
            vonage.message.sendSms(from, phone, text, {type:"unicode"}, (err, responseData) => {
                if (err) {
                    console.log(`Message to ${phone} failed with error:`);
                    console.error(err);
                    failed.push(phone)
                } else {
                    if (responseData.messages[0]['status'] !== "0") {
                        console.log(`Message to ${phone} failed with error: ${responseData.messages[0]['error-text']}`);
                        failed.push(phone)
                    } else {
                        console.log("Message sent to ", phone)
                    }
                }
                count++;
                if (count == to.length) {
                    res.status(200)
                    res.json({ failed });
                }
            })
        })
    })
});