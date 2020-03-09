// Function to add shutdown callbacks
module.exports = function addShutdownFn(shutdown, proc = process) {
    proc.on('exit', shutdown);
    proc.on('SIGINT', shutdown);
    proc.on('SIGTERM', shutdown);
};
