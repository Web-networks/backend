import sh from 'shelljs';
import config from 'config';

import chalk from 'chalk';
import { shell } from './lib/colorofulShell';
import { addShutdownFn } from './lib/addShutdownFunc';

const maxTimeToWait = 20000;
const dbPort = config.get('dbPort');

function main() {
    // Check that docker is pre-installed
    if (!sh.which('docker')) {
        sh.echo('Docker is needed to run this command.');
        process.exit(1);
    }
    process.stdout.write(`🍗  ${chalk.yellowBright('Setting up DB...')}\n`);
    // Pull mongo docker cantainer
    sh.exec('docker pull mongo', { silent: true });
    // Run DB locally in docker container
    const {
        code: dockerDBCode,
        stdout: dbContainerID,
        stderr: errorDocker,
    } = sh.exec(`docker run -d -p ${dbPort}:27017 mongo`, { silent: true });
    if (dockerDBCode) {
        process.stderr.write(errorDocker);
        process.exit(1);
    }

    // start server
    process.stdout.write(`🥩  ${chalk.yellowBright('Starting server...')}\n`);
    const serverProcess = sh.exec('ts-node ./src/app.ts', { async: true, env: process.env, silent: true });
    const timerToStop = setTimeout(() => {
        serverProcess.kill();
        process.stderr.write('Server not started');
        process.exit(1);
    }, maxTimeToWait);

    // Define shutdown callback
    const shutdownFunc = () => {
        serverProcess.kill();
        const { code: dockerStopCode, stderr: error } = sh.exec(`docker stop ${dbContainerID}`, { silent: true });
        if (dockerStopCode) {
            process.stderr.write(`Error during stopping container: ${dbContainerID}\n${error}`);
        }
    };
    addShutdownFn(shutdownFunc);

    // @ts-ignore
    serverProcess.stdout.on('data', data => {
        // check that server starts to work
        if (data.includes('Server listening')) {
            clearTimeout(timerToStop);

            // make fictures for testing
            process.stdout.write(`🍺  ${chalk.yellowBright('Making fixtures...')}\n`);
            sh.exec('ts-node ./tasks/load-fixtures.ts', { silent: true, env: process.env });

            // start to test
            process.stdout.write(`🍻  ${chalk.yellowBright('Start testing...')}\n`);
            // @ts-ignore
            // eslint-disable-next-line promise/prefer-await-to-then
            shell('yarn mocha').then(({ code }) => {
                process.exit(code);
            });
        }
    });
}

main();
