{
  "targets": [
    {
      "target_name": "luajit-decompiler",
      "sources": [
        "src/addon.cpp",
        "src/main.cpp",
        "src/bytecode/bytecode.cpp",
        "src/bytecode/prototype.cpp",
        "src/ast/ast.cpp",
        "src/lua/lua.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "cflags_cc!": [
        "-fno-exceptions"
      ],
      "cflags_cc+": [
        "-std=c++20"
      ],
      "defines": [
        "NAPI_DISABLE_CPP_EXCEPTIONS"
      ],
      "conditions": [
        [
          "OS==\"win\"",
          {
            "msvs_settings": {
              "VCCLCompilerTool": {
                "AdditionalOptions": [
                  "/std:c++20",
                  "/J"
                ],
                "ExceptionHandling": 1
              }
            },
            "cflags!": [
              "/std:c++20"
            ],
            "cflags_cc!": [
              "/std:c++20"
            ]
          }
        ],
        [
          "OS==\"mac\"",
          {
            "xcode_settings": {
              "OTHER_CPLUSPLUSFLAGS": [
                "-std=c++20"
              ]
            }
          }
        ],
        [
          "OS==\"linux\"",
          {
            "cflags": [
              "-std=c++20"
            ],
            "cflags_cc": [
              "-std=c++20"
            ]
          }
        ]
      ]
    }
  ]
}
