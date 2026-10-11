const { Worker } = require('node:worker_threads');
const path = require('node:path');
let native;

function validatePath(filePath) {
  if (typeof filePath !== 'string' || !filePath.trim() || filePath.includes('\0')) {
    throw new TypeError('filePath must be a non-empty string without null bytes');
  }
  return path.resolve(filePath);
}

exports.decompile = function decompile(filePath) {
  const resolved = validatePath(filePath);
  native ??= require('bindings')('luajit-decompiler');
  return native.decompile(resolved);
};

exports.decompileAsync = function decompileAsync(filePath, options = {}) {
  return new Promise((resolve, reject) => {
    const resolved = validatePath(filePath);
    const { timeout = 0, signal } = options;
    if (!Number.isSafeInteger(timeout) || timeout < 0 || timeout > 2147483647) {
      throw new TypeError('timeout must be an integer between 0 and 2147483647');
    }
    if (signal !== undefined && !(signal instanceof AbortSignal)) {
      throw new TypeError('signal must be an AbortSignal');
    }
    if (signal?.aborted) {
      const error = new Error('Decompilation aborted');
      error.name = 'AbortError';
      reject(error);
      return;
    }
    const worker = new Worker(path.join(__dirname, 'worker.js'), { workerData: resolved });
    let settled = false;
    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      if (error) reject(error); else resolve(result);
    };
    const abort = () => {
      const error = new Error('Decompilation aborted');
      error.name = 'AbortError';
      finish(error);
      void worker.terminate();
    };
    const timer = timeout ? setTimeout(() => {
      const error = new Error('Decompilation timed out');
      error.name = 'TimeoutError';
      finish(error);
      void worker.terminate();
    }, timeout) : undefined;
    worker.once('message', message => {
      if (message.error) {
        const error = new Error(message.error.message);
        error.name = message.error.name;
        finish(error);
      } else finish(null, message.source);
    });
    worker.once('error', error => finish(error));
    worker.once('exit', code => {
      if (!settled) finish(new Error('Decompiler worker exited without a result (code ' + code + ')'));
    });
    signal?.addEventListener('abort', abort, { once: true });
  });
};
