const sh = require('shelljs');
const log4js = require('log4js');

const addShutdownFn = require('./lib/addShutdownFunc');

const logger = log4js.getLogger();
logger.level = 'debug';

/* eslint-disable no-console  */

function configureEnv() {
    return { ...process.env };
}

const DB_PORT = process.env.DB_PORT || '27017';

function main() {
    // Check that docker is pre-installed
    if (!sh.which('docker')) {
        sh.echo('Docker is needed to run this command.');
        sh.exit(1);
    }
    logger.info('Setting up MongoDB container..............');
    // Pull mongo docker cantainer
    sh.exec('docker pull mongo', { silent: true });
    // Run DB locally in docker container
    const {
        code,
        stdout: dbContainerID,
        stderr: errorDocker,
    } = sh.exec(`docker run -d -p ${DB_PORT}:27017 mongo`, { silent: true });
    if (code) {
        console.error(errorDocker);
        process.exit(1);
    }
    // Run server application in dev mode
    logger.info('Setting up server.........................');
    const serverProcess = sh.exec(
        'yarn ts-node-dev --clear --respawn --transpileOnly ./src/app.ts',
        { async: true, env: configureEnv() },
    );

    // On stop application should stop docker db container
    addShutdownFn(() => {
        serverProcess.kill();
        const { code: exitCode, stderr: error } = sh.exec(`docker stop ${dbContainerID}`, { silent: true });
        if (exitCode) {
            console.error(`Error during stopping container: ${dbContainerID}\n${error}`);
        }
    });
}

main();
