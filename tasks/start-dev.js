const sh = require('shelljs');

const addShutdownFn = require('./lib/addShutdownFunc');

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
    console.log('⏳  Setting up DB');
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
    console.log('🚀  Launching server');
    const serverProcess = sh.exec(
        'yarn ts-node -C ttypescript ./src/app.ts',
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
