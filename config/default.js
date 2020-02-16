// Default config

require('dotenv').config();

const DB_PORT = 27017;
const PORT = 5050;

module.exports = {
    port: PORT,
    appHost: `http://localhost:${PORT}`,
    sessionSecret: process.env.SESSION_SECRET,
    dbHost: `mongodb://localhost:${DB_PORT}`,
    dbPort: DB_PORT,
};
