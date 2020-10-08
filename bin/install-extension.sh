#!/bin/bash

npm install
npx vsce package
code --install-extension vscode-clojure-lsp-1.0.0.vsix
rm vscode-clojure-lsp-1.0.0.vsix