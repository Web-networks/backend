import { spawn } from 'child_process';

export function shell(cmd: string, env = process.env) {
    const [command, ...args] = cmd.split(' ');
    const childProcess = spawn(command, args, { stdio: 'inherit', env });
    return new Promise(resolve => {
        childProcess.on('exit', code => {
            resolve({ code });
        });
    });
}
