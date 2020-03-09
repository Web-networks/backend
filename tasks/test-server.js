const sh = require('shelljs');
const config = require('config');

const exec = require('./lib/colorofulShell');
const addShutdownFunc = require('./lib/addShutdownFunc');

const maxTimeToWait = 20000;
const dbPort = config.get('dbPort');

function main() {
    // Check that docker is pre-installed
    if (!sh.which('docker')) {
        sh.echo('Docker is needed to run this command.');
        process.exit(1);
    }
    console.log('🍗  Setting up DB...');
    // Pull mongo docker cantainer
    sh.exec('docker pull mongo', { silent: true });
    // Run DB locally in docker container
    const {
        code: dockerDBCode,
        stdout: dbContainerID,
        stderr: errorDocker,
    } = sh.exec(`docker run -d -p ${dbPort}:27017 mongo`, { silent: true });
    if (dockerDBCode) {
        console.error(errorDocker);
        process.exit(1);
    }

    // building app
    console.log('🍔  Building app...');
    sh.exec('yarn build', { silent: true });

    // start server listening
    console.log('🥩  Starting server...');
    const serverProcess = sh.exec('node ./build/app.js', { async: true, env: process.env, silent: true });
    const timerToStop = setTimeout(() => {
        serverProcess.kill();
        console.error('Server not started');
        process.exit(1);
    }, maxTimeToWait);

    // Define shutdown callback
    const shutdownFunc = () => {
        serverProcess.kill();
        const { code: dockerStopCode, stderr: error } = sh.exec(`docker stop ${dbContainerID}`, { silent: true });
        if (dockerStopCode) {
            console.error(`Error during stopping container: ${dbContainerID}\n${error}`);
        }
    };
    addShutdownFunc(shutdownFunc);

    serverProcess.stdout.on('data', (data) => {
        // check that server starts to work
        if (data.includes('Server listening')) {
            clearTimeout(timerToStop);

            // make fictures for testing
            console.log('🍺  Making fixtures...');
            sh.exec('node ./tasks/load-fixtures.js', { silent: true, env: process.env });

            // start to test
            console.log('🍻  Start testing...');
            exec('yarn mocha').then(({ code }) => {
                process.exit(code);
            });
        }
    });
}

main();
