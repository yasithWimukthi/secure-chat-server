import SHA256 from "crypto-js/sha256";
import Messages from "../models/message";

const saveMessage = async (req,res) => {
    const message = req.body.message;
    var hasheddata = SHA256(message).toString();
    try {
        const savedMessage = await Messages.create({ text: hasheddata });
        return res
            .status(200)
            .send({ msg: "Message received successfully", savedMessage });
    } catch (e) {
        return res.status(500).send(e.error);
    }
}

module.exports = {
    saveMessage
}