require('dotenv').config();

const PORT = process.env.PORT || 5050;

module.exports = {
    port: PORT,
    sessionSecret: process.env.SESSION_SECRET,
};
