#include <napi.h>
#include "main.h"

struct Error {
    const std::string message;
    const std::string filePath;
    const std::string function;
    const std::string source;
    const std::string line;
};

std::string decompile(const char* inputPath);
void assert(const bool& assertion, const std::string& message, const std::string& filePath, const std::string& function, const std::string& source, const uint32_t& line);

Napi::Value DecompileWrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected one argument").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (!info[0].IsString()) {
        Napi::TypeError::New(env, "Expected a string as the first argument").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string inputPath = info[0].As<Napi::String>().Utf8Value();

    try {
        std::string output = decompile(inputPath.c_str());
        return Napi::String::New(env, output);
    }
    catch (const Error& err) {
        std::string errorMessage = "\nError running " + err.function + "\nSource: " + err.source + ":" + err.line + "\n\n" + err.message;
        Napi::Error::New(env, errorMessage).ThrowAsJavaScriptException();
        return env.Null();
    }
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(
        Napi::String::New(env, "decompile"),
        Napi::Function::New(env, DecompileWrapped)
    );

    return exports;
}

NODE_API_MODULE(addon, Init)
