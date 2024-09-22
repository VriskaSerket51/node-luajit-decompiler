const decompiler = require("bindings")("luajit-decompiler");

export function decompile(filePath) {
  const output = decompiler.decompile(filePath);
  return output;
}
