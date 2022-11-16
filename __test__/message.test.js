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

const validRequest1 = {
    body: {
        message: "Hello World"
    },
    headers: {
        signature: "d54f5rgfd5454g"
    }
}

const validRequest2 = {
    body: {
        message: "Hello World"
    }
}

// check with invalid payload
it('should return message with 401 status code', async () => {
    const response = await request(app).post('/message').send(invalidRequest.body).set(invalidRequest.headers);
    expect(response.statusCode).toBe(401);
})

// check with invalid signature payload
it('should return message with 200 status code', async () => {
    const response = await request(app).post('/message').send(validRequest1.body).set(validRequest1.headers);
    expect(response.statusCode).toBe(200);
})

// check with without signature  payload
it('should return message with 401 status code', async () => {
    const response = await request(app).post('/message').send(validRequest2.body).set(validRequest2.headers);
    expect(response.statusCode).toBe(401);
})