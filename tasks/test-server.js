const sh = require('shelljs');

const DB_PORT_FOR_TESTING = 27016;
const TEST_PORT = 5051;

const maxTimeToWait = 20000;

function main() {
    const serverProcess = sh.exec(`DB_PORT=${DB_PORT_FOR_TESTING} PORT=${TEST_PORT} yarn start-dev`, { async: true });
    const timerToStop = setTimeout(() => {
        serverProcess.kill();
        console.error('Server not started');
        process.exit(1);
    }, maxTimeToWait);
    serverProcess.stdout.on('data', (data) => {
        if (data.includes('Server listening')) {
            clearTimeout(timerToStop);
            const { code } = sh.exec(`PORT=${TEST_PORT} NODE_ENV=development yarn jest`);
            serverProcess.kill();
            process.exit(code);
        }
    });
}

main();
