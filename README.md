# Node LuaJIT Decompiler

Node.js native wrapper for [luajit-decompiler-v2](https://github.com/marsinator358/luajit-decompiler-v2).

## Build

Requires Node.js 22.22.2+, 24.15.0+, or 26+ (matching the local node-gyp toolchain), Python, and a C++20 compiler. On Windows, install Visual Studio with Desktop development with C++; on macOS, install Xcode Command Line Tools; on Linux, install a C++20 toolchain and make.

Run npm install, then npm run build. The repository declares node-gyp as a development dependency so local builds do not rely on a global installation.

## Installation in another project

The package builds its native addon during installation. Package managers that block dependency installation scripts need explicit approval. With npm versions that support allowScripts, add the following to the consuming project's package.json:

```json
{
  "allowScripts": {
    "luajit-decompiler": true
  }
}
```

Then run npm rebuild luajit-decompiler. This approval belongs to the consuming project; this package cannot authorize its own script in another project.

## Usage

```js
const { decompile } = require('luajit-decompiler');
const source = decompile('/absolute/path/to/bytecode.lua');
```

Run npm test after building. Tests verify module loading and argument/error handling; real bytecode decompilation requires a LuaJIT fixture.

## Async API

Use decompileAsync(filePath, { timeout, signal }) to run native work on a worker thread. The synchronous decompile API remains available. Native bindings load on the first decompile call. Each async call creates a worker; callers should limit concurrent calls for large batches. Cancellation rejects promptly, but termination of an executing native call can wait until the native call returns. A worker thread does not isolate native crashes from the process.

File I/O uses standard C++ streams and UTF-8 filesystem paths. CI is configured for Windows, macOS, and Linux with Node 22, 24, and 26. Windows is verified locally; macOS/Linux await CI verification.

## Upstream source

AST and condition reconstruction synchronized with marsinator358/luajit-decompiler-v2 commit 6a8a0cec48fdf175dddaca5d3fbfe3aa59b5550a (2026-05-14). CLI progress rendering is omitted; portable file I/O and the Node wrapper remain local adaptations.

Both decompile(input) and decompileAsync(input, options) accept Buffer or Uint8Array as well as a file path. Bytecode is parsed in memory without temporary files. Async input is copied into the worker; the caller buffer is not transferred or detached.
