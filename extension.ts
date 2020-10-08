import * as lsp from "vscode-languageclient";
import * as vscode from "vscode";
 
let jarEventEmitter = new vscode.EventEmitter();
let contentsRequest = new lsp.RequestType('clojure/dependencyContents'); 
let client :lsp.LanguageClient;

export function activate(context: vscode.ExtensionContext) {

  let runCommnad :lsp.Executable = { command: "bash", args: ["-c", "clojure-lsp"] };
  let serverOptions :lsp.ServerOptions = {
    run: runCommnad
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
	let myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	myStatusBarItem.command = commandId;
	context.subscriptions.push(myStatusBarItem);

  client = new lsp.LanguageClient('clojure-lsp', 'Clojure Language Client', serverOptions, clientOptions, false)

  let rnfn = () => {
      myStatusBarItem.text = "Starting LSP Clojure Server";
      myStatusBarItem.show();
      return client.start();
    };

    client.onReady().then(() => {
      myStatusBarItem.text = "Clojure LSP Ready";
      myStatusBarItem.show();
    })

  context.subscriptions.push(rnfn());

  //     myStatusBarItem.text = "Starting LSP Clojure Server";
  //     myStatusBarItem.show();
  // context.subscriptions.push(languageClient.start());

  let provider = {
    onDidChange: jarEventEmitter.event,
    provideTextDocumentContent: (uri, token) => {
      return client.sendRequest(contentsRequest, { uri: decodeURIComponent(uri.toString()) }, token).then((v) => {
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