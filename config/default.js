// Default config

require('dotenv').config();

const DB_PORT = 27017;
const DB_HOST = process.env.DB_HOST || 'localhost';
const PORT = 5050;

module.exports = {
    port: PORT,
    appHost: `http://localhost:${PORT}`,
    sessionSecret: process.env.SESSION_SECRET,
    dbHost: `mongodb://${DB_HOST}:${DB_PORT}`,
    dbPort: DB_PORT,
    aws: {
        region: 'ru-central1',
        endpoint: 'https://storage.yandexcloud.net',
        maxFileSize: 1048576
    }
};
