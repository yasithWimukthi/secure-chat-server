var jwtAuthz = require("express-jwt-authz");
require("dotenv").config();

const jwtAuthzOptions = {
  customScopeKey: "permissions",
  checkAllScopes: true,
  failWithError: true,
};

const checkAdminPermissions = jwtAuthz(
  ["write:send_messages", "write:save_files"],
  jwtAuthzOptions
);

const checkWorkerPermissions = jwtAuthz(
  ["write:send_messages"],
  jwtAuthzOptions
);

const checkManagerPermissions = jwtAuthz(
  ["write:send_messages", "write:save_files"],
  jwtAuthzOptions
);

module.exports = {
  checkAdminPermissions,
  checkWorkerPermissions,
  checkManagerPermissions,
};
