import sh from 'shelljs';

import { addShutdownFn } from './lib/addShutdownFunc';
import chalk from 'chalk';

const DB_PORT = process.env.DB_PORT || '27017';

async function main() {
    // Check that docker is pre-installed
    if (!sh.which('docker')) {
        sh.echo('Docker is needed to run this command.');
        sh.exit(1);
    }
    process.stdout.write(chalk.yellowBright('⏳  Setting up DB\n'));
    const [_, ...mongoImages] = sh.exec('docker images mongo', { silent: true }).split(/\n/).filter(Boolean);
    if (!mongoImages.length) {
        // Pull mongo docker cantainer
        sh.exec('docker pull mongo');
    }
    // Run DB locally in docker container
    const {
        code,
        stdout: dbContainerID,
        stderr: errorDocker,
    } = sh.exec(`docker run -d -p ${DB_PORT}:27017 mongo`, { silent: true });
    if (code) {
        process.stderr.write(errorDocker);
        process.exit(1);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Load fixtures
    process.stdout.write(chalk.yellowBright('🍺  Making fixtures\n'));
    const {
        code: fixturesCode,
        stderr: fixturesError,
    } = sh.exec('yarn ts-node ./tasks/load-fixtures.ts', { env: process.env, silent: true });
    if (fixturesCode) {
        process.stderr.write(fixturesError);
        process.exit(1);
    }
    // Run server application in dev mode
    process.stdout.write(chalk.yellowBright('🚀  Launching server\n'));
    const serverProcess = sh.exec(
        'yarn ts-node-dev ./src/app.ts',
        { async: true },
    );

    // On stop application should stop docker db container
    addShutdownFn(() => {
        serverProcess.kill();
        const { code: exitCode, stderr: error } = sh.exec(`docker stop ${dbContainerID}`, { silent: true });
        if (exitCode) {
            process.stderr.write(`Error during stopping container: ${dbContainerID}\n${error}`);
        }
    });
}

main();
