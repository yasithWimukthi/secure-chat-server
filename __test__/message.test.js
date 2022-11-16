const {saveMessage} = require('../controllers/message.controller');

// Path: __test__\message.test.js
// Compare this snippet from controllers\message.controller.js:

const invalidRequest = {
    body: {
        message1: "Hello World"
    },
    headers: {
        signature: "d54f5rgfd5454g"
    }
};

// check with invalid payload
it('should return message with 401 status code', async () => {

})