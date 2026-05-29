import * as vscode from "vscode";
import * as path from "path";
import { convertFileToMarkdown, generateMarkdown } from "../core";

export function activate(context: vscode.ExtensionContext) {
  const disposable1 = vscode.commands.registerCommand(
    "markdown-them.convertToMarkdown",
    async (...args) => {
      let uris: vscode.Uri[] = [];
      if (args && args.length > 1 && Array.isArray(args[1])) {
        uris = args[1];
      } else if (args && args.length > 0 && args[0] instanceof vscode.Uri) {
        uris = [args[0]];
      } else {
        vscode.window.showInformationMessage("Please right-click on files in the Explorer to convert.");
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Converting to Markdown",
          cancellable: false,
        },
        async () => {
          const config = vscode.workspace.getConfiguration("markdown-them");
          const maxConcurrent = Math.min(16, Math.max(1, config.get<number>("maxConcurrentConversions", 6)));

          let active = 0;
          let index = 0;
          const queue = [...uris];

          await new Promise<void>((resolve) => {
            const tryNext = () => {
              while (active < maxConcurrent && index < queue.length) {
                const uri = queue[index++];
                active++;

                convertFileToMarkdown(uri.fsPath)
                  .then((mdPath) => {
                    console.log(`Successfully converted: ${uri.fsPath} to ${mdPath}`);
                    vscode.window.showInformationMessage(`Successfully converted: ${path.basename(mdPath)}`);
                  })
                  .catch((e: any) => {
                    console.error(`Failed to convert ${uri.fsPath}:`, e);
                    vscode.window.showErrorMessage(`Failed to convert ${path.basename(uri.fsPath)}: ${e.message}`);
                  })
                  .finally(() => {
                    active--;
                    if (active === 0 && index >= queue.length) {
                      resolve();
                    } else {
                      tryNext();
                    }
                  });
              }
            };

            tryNext();
          });
        },
      );
    },
  );

  const disposable2 = vscode.commands.registerCommand("markdown-them.convertCurrentToMarkdown", async () => {
    let filePath = "";

    const editor = vscode.window.activeTextEditor;
    if (editor) {
      filePath = editor.document.uri.fsPath;
    } else {
      const activeTab = vscode.window.tabGroups.activeTabGroup.activeTab;
      if (activeTab && (activeTab.input as any)?.uri) {
        filePath = ((activeTab.input as any).uri as vscode.Uri).fsPath;
      }
    }

    if (!filePath) {
      vscode.window.showErrorMessage("No active file to convert.");
      return;
    }

    try {
      const mdContent = await generateMarkdown(filePath);
      console.log(`Successfully converted current file: ${filePath}`);
      const doc = await vscode.workspace.openTextDocument({
        content: mdContent,
        language: "markdown",
      });
      await vscode.window.showTextDocument(doc, {
        preview: false,
        viewColumn: vscode.ViewColumn.Beside,
      });
    } catch (e: any) {
      console.error(`Failed to convert ${filePath}:`, e);
      vscode.window.showErrorMessage(`Failed to convert ${path.basename(filePath)}: ${e.message}`);
    }
  });

  const disposable3 = vscode.commands.registerCommand("markdown-them.setMaxConcurrentConversions", async () => {
    const config = vscode.workspace.getConfiguration("markdown-them");
    const current = config.get<number>("maxConcurrentConversions", 6);

    const input = await vscode.window.showInputBox({
      title: "Set Max Concurrent Conversions",
      prompt: "Number of files converted simultaneously (1 - 16)",
      value: String(current),
      validateInput: (raw) => {
        const n = parseInt(raw, 10);
        if (isNaN(n) || !Number.isInteger(n)) {
          return "Please enter a whole number.";
        }
        if (n < 1 || n > 16) {
          return "Value must be between 1 and 16.";
        }
        return null;
      },
    });

    if (input === undefined) {
      return;
    }

    const value = Math.min(16, Math.max(1, parseInt(input, 10)));
    await config.update("maxConcurrentConversions", value, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`Markdown Them: Max concurrent conversions set to ${value}.`);
  });

  context.subscriptions.push(disposable1, disposable2, disposable3);
}

export function deactivate() {}
