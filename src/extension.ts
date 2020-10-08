import * as lsp from "vscode-languageclient";
import * as vscode from "vscode";

class ClojureUri {
  uri: string
};

let jarEventEmitter :vscode.EventEmitter<vscode.Uri> = new vscode.EventEmitter();
let contentsRequest = new lsp.RequestType<ClojureUri, string, string, string>('clojure/dependencyContents'); 
let client :lsp.LanguageClient;

export function activate(context: vscode.ExtensionContext) {

  let runCommnad :lsp.Executable = { command: "bash", args: ["-c", "clojure-lsp"] };
  let debugCommnad :lsp.Executable = { command: "bash", args: ["-c", "clojure-lsp"] };
  let serverOptions :lsp.ServerOptions = {
    run: runCommnad,
    debug: debugCommnad
  };

  // Options to control the language client
  let clientOptions = {
    // Register the server for plain text documents
    documentSelector: [{ scheme: 'file', language: 'clojure' }],
    synchronize: {
      configurationSection: 'clojure-lsp',
      fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
    },
    initializationOptions: {
      "dependency-scheme": "jar"
    }
  };

  let commandId = "vscode-clojure-lsp-start";

	// create a new status bar item that we can now manage
	let clientStatus : vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	clientStatus.command = commandId;
	context.subscriptions.push(clientStatus);

  client = new lsp.LanguageClient('clojure-lsp', 'Clojure Language Client', serverOptions, clientOptions, false)

  let startLSPClient = () => {
      clientStatus.text = "Starting LSP Clojure Server";
      clientStatus.color = "#ff5e00";
      clientStatus.show();
      return client.start();
    };

    client.onReady().then(() => {
      clientStatus.text = "Clojure LSP Ready";
      clientStatus.color = "#0F0";
      clientStatus.show();
    })

  context.subscriptions.push(startLSPClient());

  let provider: vscode.TextDocumentContentProvider = {
    onDidChange: jarEventEmitter.event,
    provideTextDocumentContent: (uri: vscode.Uri, token: vscode.CancellationToken) => {
      return client.sendRequest(contentsRequest, { uri: decodeURIComponent(uri.toString()) }, token)
        .then((v) => {
          return v || '';
        });
    }
  };
  context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('jar', provider));
}

// this method is called when your extension is deactivated
export function deactivate() {
  client.stop();
}