const DB_PORT = process.env.DB_PORT || '27017';

module.exports = {
    dbHost: `mongodb://localhost:${DB_PORT}`,
};
