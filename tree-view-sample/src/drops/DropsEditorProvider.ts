'use strict';

import * as vscode from 'vscode';

class DropsEditorProvider implements vscode.CustomTextEditorProvider {

	constructor(private readonly extensionUri: vscode.Uri) { }

    public async resolveCustomTextEditor(document: vscode.TextDocument, panel: vscode.WebviewPanel) {

		function sendDocumentToWebview() {
			panel.webview.postMessage(
				JSON.parse(document.getText().trim() || '[]')
			);
		}
		function updateDocument(items: any) {
			const edit = new vscode.WorkspaceEdit();
			edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), JSON.stringify(items, null, 2));
			return vscode.workspace.applyEdit(edit);
		}

		const disposables: vscode.Disposable[] = [];
		function dispose() {
			while (disposables.length) {
				disposables.pop()?.dispose();
			}
		}

        panel.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')],
        };
        panel.webview.html = this.getHtmlForWebview(panel.webview);

		vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				sendDocumentToWebview();
			}
		}, this, disposables);

		panel.webview.onDidReceiveMessage((data) => {
			if (data === 'onWebviewReady') {
				sendDocumentToWebview();
			} else {
				updateDocument(data);
			}
		}, this, disposables);

		panel.onDidDispose(dispose, this, disposables);
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
		const nonce = getNonce();
		const scriptSrc = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'DropsEditor.js'));
		// <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self' 'unsafe-inline' 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
		return `<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<style>
					.dropTarget { border: 1px dashed var(--vscode-inputValidation-errorBorder); width: 100px; height: 100px; }
					.dragExample { border-radius: 9001px; border: 1px solid var(--vscode-button-background); color: var(--vscode-button-background); padding: 0.2em 0.5em; } 
					.dragoverHighlight { background-color: var(--vscode-inputValidation-infoBackground); }
				</style>
			</head>
			<body style="min-height:100vh">
				<br>
				<!-- <div id="dropTarget" class="dropTarget"></div> -->
				<span class="dragExample" draggable="true">dragExample1</span>
				<span class="dragExample" draggable="true">dragExample2</span>
				<pre id="dragoverXY" style="float:right"></pre>
				<br>
				<pre id="store" style="font-size:small"></pre>
				<script nonce="${nonce}" src="${scriptSrc}"></script>
			</body>
		</html>`;
    }
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

export default DropsEditorProvider;
