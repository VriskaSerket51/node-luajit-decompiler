# Node LuaJIT Decompiler

English | [한국어](README.ko.md)

A native Node.js wrapper for [luajit-decompiler-v2](https://github.com/marsinator358/luajit-decompiler-v2).

## Build

Requires Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`, Python and a C++20 compiler.

Use Visual Studio C++ build tools on Windows, Xcode Command Line Tools on macOS, or a C++ compiler and make on Linux.

```sh
npm install
npm run build
```

## Installation in another project

The native addon is built during installation. If npm blocks the install script, add this to your project's `package.json`:

```json
{"allowScripts":{"luajit-decompiler":true}}
```

Run `npm rebuild luajit-decompiler` to rebuild it.

## How to use

```js
const { decompile } = require('luajit-decompiler');

const source = decompile('/absolute/path/to/bytecode.lua');
const fromBytes = decompile(bytecodeBuffer);
```

Accepts a file path, Buffer or Uint8Array.

## Async API

```js
const { decompileAsync } = require('luajit-decompiler');
const source = await decompileAsync(bytecodeBuffer, { timeout: 10000 });
```

Pass `signal` to cancel. Worker termination may wait for an executing native call to finish. A native crash can terminate the application.

See [LICENSE](LICENSE).
