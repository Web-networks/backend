const { spawn } = require('child_process');

module.exports = function shell(cmd, env = process.env) {
    const [command, ...args] = cmd.split(' ');
    const childProcess = spawn(command, args, { stdio: 'inherit', env });
    return new Promise((resolve) => {
        childProcess.on('exit', (code) => {
            resolve({ code });
        });
    });
};
