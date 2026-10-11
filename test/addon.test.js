const { test } = require('node:test');
const assert = require('node:assert/strict');
const { decompile } = require('../src');

test('native addon exports the decompiler', () => {
  assert.equal(typeof decompile, 'function');
});

test('invalid arguments raise JavaScript errors', () => {
  assert.throws(() => decompile(), TypeError);
  assert.throws(() => decompile(123), TypeError);
});

test('missing input raises a JavaScript error', () => {
  const path = require('node:path');
  assert.throws(() => decompile(path.join(__dirname, 'missing-bytecode.lua')));
});

const { decompileAsync } = require('../src');
test('rejects empty and null-byte paths', async () => {
  for (const input of ['', ' ', 'bad\0path', null]) {
    assert.throws(() => decompile(input), TypeError);
    await assert.rejects(decompileAsync(input), TypeError);
  }
});
test('async native errors reject without crashing the main thread', async () => {
  await assert.rejects(decompileAsync(require('node:path').join(__dirname, 'missing-bytecode.lua')));
});
test('async cancellation and options are validated', async () => {
  const controller = new AbortController(); controller.abort();
  await assert.rejects(decompileAsync('missing.lua', { signal: controller.signal }), { name: 'AbortError' });
  await assert.rejects(decompileAsync('missing.lua', { timeout: -1 }), TypeError);
  await assert.rejects(decompileAsync('missing.lua', { signal: {} }), TypeError);
});

test('native bindings remain unloaded until needed', () => {
  const cp = require('node:child_process');
  cp.execFileSync(process.execPath, ['-e', "const m=require('node:module');const old=m._load;m._load=function(id,...args){if(id==='bindings')throw Error('unexpected native load');return old.call(this,id,...args)};require('./src');"], { cwd: require('node:path').join(__dirname, '..') });
});
test('timeout and active cancellation reject promptly', async () => {
  await assert.rejects(decompileAsync('missing.lua', { timeout: 1 }), { name: 'TimeoutError' });
  const controller = new AbortController();
  const task = decompileAsync('missing.lua', { signal: controller.signal });
  controller.abort();
  await assert.rejects(task, { name: 'AbortError' });
});

test('minimal LuaJIT chunk decompiles through a Unicode path', async () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const dir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'luajit-fixture-'));
  const file = path.join(dir, '한글.lua');
  // Stripped LuaJIT v2 vararg chunk containing RET0.
  fs.writeFileSync(file, Buffer.from([27, 76, 74, 2, 2, 11, 2, 0, 1, 0, 0, 0, 1, 75, 0, 1, 0, 0]));
  try {
    assert.equal(decompile(file), '');
    assert.equal(await decompileAsync(file), '');
  } finally {
    fs.unlinkSync(file);
    fs.rmdirSync(dir);
  }
});

test('stripped vararg branch reconstructs both return paths', async () => {
  const file = require('node:path').join(__dirname, 'fixtures', 'branch.ljc');
  const source = decompile(file);
  assert.match(source, /if \.\.\. then/);
  assert.match(source, /return 42/);
  assert.match(source, /return 7/);
  assert.equal(await decompileAsync(file), source);
});

test('memory inputs match path output, including offset views', async () => {
  const fs = require('node:fs'), path = require('node:path');
  const file = path.join(__dirname, 'fixtures', 'branch.ljc');
  const bytes = fs.readFileSync(file), expected = decompile(file);
  const padded = new Uint8Array(bytes.length + 9); padded.set(bytes, 4);
  for (const input of [bytes, Uint8Array.from(bytes), padded.subarray(4, 4 + bytes.length)]) {
    assert.equal(decompile(input), expected);
    const promise = decompileAsync(input);
    assert.equal(await promise, expected);
    assert.ok(input.byteLength > 0);
  }
  assert.throws(() => decompile(new Uint8Array()), /too small/);
  await assert.rejects(decompileAsync(new Uint8Array(20)), /Invalid header/);
  assert.throws(() => decompile(new Uint16Array(20)), TypeError);
});
