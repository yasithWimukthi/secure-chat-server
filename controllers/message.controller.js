import SHA256 from "crypto-js/sha256";
import Messages from "../models/message";
import crypto from "node:crypto";

const saveMessage = async (req,res) => {
    var hmac = crypto.createHmac("sha512", "secret");
    hmac.update(req.body.message);
    var signature = hmac.digest("hex");

    // compare hmac signature with client signature
    if (signature === req.headers.signature) {
        const message = req.body.message;
        const savedMessage = await Messages.create({ text: message });
        return res.status(200).send("Message received successfully");
    } else {
        return res.status(401).send("Message currupted");
    }
}

module.exports = {
    saveMessage
}