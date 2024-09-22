const decompiler = require("bindings")("luajit-decompiler");

exports.decompile = function decompile(filePath) {
  const output = decompiler.decompile(filePath);
  return output;
}
