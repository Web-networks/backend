// Function to add shutdown callbacks
// @ts-ignore
export function addShutdownFn(shutdown, proc = process) {
    proc.on('exit', shutdown);
    proc.on('SIGINT', shutdown);
    proc.on('SIGTERM', shutdown);
}
