# Node LuaJIT Decompiler

[English](README.md) | 한국어

[luajit-decompiler-v2](https://github.com/marsinator358/luajit-decompiler-v2)의 Node.js 네이티브 래퍼입니다.

## 빌드

Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`, Python과 C++20 컴파일러가 필요합니다.

Windows는 Visual Studio C++ 개발 도구, macOS는 Xcode Command Line Tools, Linux는 C++ 컴파일러와 make를 사용합니다.

```sh
npm install
npm run build
```

## 다른 프로젝트에 설치

설치 시 네이티브 애드온을 빌드합니다. npm에서 설치 스크립트를 차단한다면 프로젝트의 `package.json`에 다음 설정을 추가하세요.

```json
{"allowScripts":{"luajit-decompiler":true}}
```

`npm rebuild luajit-decompiler`로 다시 빌드할 수 있습니다.

## 사용 방법

```js
const { decompile } = require('luajit-decompiler');

const source = decompile('/absolute/path/to/bytecode.lua');
const fromBytes = decompile(bytecodeBuffer);
```

파일 경로, Buffer와 Uint8Array를 받습니다.

## 비동기 API

```js
const { decompileAsync } = require('luajit-decompiler');
const source = await decompileAsync(bytecodeBuffer, { timeout: 10000 });
```

`signal`로 취소할 수도 있습니다. 취소해도 실행 중인 네이티브 호출이 끝날 때까지 워커 종료가 늦어질 수 있습니다. 네이티브 코드가 크래시하면 앱도 종료될 수 있습니다.

라이선스는 [LICENSE](LICENSE)를 참고하세요.
