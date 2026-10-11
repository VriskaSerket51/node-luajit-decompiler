const { parentPort, workerData } = require('node:worker_threads');
try {
  const source = require('./index').decompile(workerData);
  parentPort.postMessage({ source });
} catch (error) {
  parentPort.postMessage({ error: { name: error.name, message: error.message } });
}
