// Empty module stub — used by Turbopack resolveAlias to eliminate
// server-only packages (pino, pino-pretty, thread-stream) from the
// client bundle. These are pulled in by @walletconnect/logger but
// are never actually used in the browser.
module.exports = {};
