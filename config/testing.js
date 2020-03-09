// Config for testing environment

const DB_PORT = 27018;
const PORT = 5051;

module.exports = {
    port: PORT,
    appHost: `http://localhost:${PORT}`,
    dbHost: `mongodb://localhost:${DB_PORT}`,
    dbPort: DB_PORT,
};
