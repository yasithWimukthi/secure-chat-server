var jwt = require("express-jwt");
var jwks = require("jwks-rsa");
require("dotenv").config();

const verifyJwt = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH_ISSUER}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH_ISSUER}/`,
  algorithms: ["RS256"],
});

module.exports = verifyJwt;
