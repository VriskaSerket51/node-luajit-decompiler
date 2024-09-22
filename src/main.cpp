#include "main.h"

struct Error {
	const std::string message;
	const std::string filePath;
	const std::string function;
	const std::string source;
	const std::string line;
};

static const HANDLE CONSOLE_OUTPUT = GetStdHandle(STD_OUTPUT_HANDLE);
static const HANDLE CONSOLE_INPUT = GetStdHandle(STD_INPUT_HANDLE);
static bool isProgressBarActive = false;

static struct {
	bool showHelp = false;
	bool silentAssertions = false;
	bool forceOverwrite = false;
	bool ignoreDebugInfo = false;
	bool minimizeDiffs = false;
	bool unrestrictedAscii = false;
	std::string inputPath;
	std::string outputPath;
	std::string extensionFilter;
} arguments;

std::string decompile(const char* inputPath) {
	Bytecode bytecode(inputPath);
	Ast ast(bytecode, false, false);
	Lua lua(bytecode, ast, false, false, true);

	bytecode();
	ast();
	std::string output = lua();

	return output;
}

void assert(const bool& assertion, const std::string& message, const std::string& filePath, const std::string& function, const std::string& source, const uint32_t& line) {
	if (!assertion) throw Error{
		.message = message,
		.filePath = filePath,
		.function = function,
		.source = source,
		.line = std::to_string(line)
	};
}

std::string byte_to_string(const uint8_t& byte) {
	char string[] = "0x00";
	uint8_t digit;
	
	for (uint8_t i = 2; i--;) {
		digit = (byte >> i * 4) & 0xF;
		string[3 - i] = digit >= 0xA ? 'A' + digit - 0xA : '0' + digit;
	}

	return string;
}
