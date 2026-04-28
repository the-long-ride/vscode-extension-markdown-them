import './polyfill';
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs/promises";
import { generateMarkdown } from './converters';

export function activate(context: vscode.ExtensionContext) {
  let disposable1 = vscode.commands.registerCommand(
    "markdown-them.convertToMarkdown",
    async (...args) => {
      let uris: vscode.Uri[] = [];
      if (args && args.length > 1 && Array.isArray(args[1])) {
        uris = args[1];
      } else if (args && args.length > 0 && args[0] instanceof vscode.Uri) {
        uris = [args[0]];
      } else {
        vscode.window.showInformationMessage(
          "Please right-click on files in the Explorer to convert.",
        );
        return;
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Converting to Markdown",
          cancellable: false,
        },
        async (progress) => {
          const config = vscode.workspace.getConfiguration("markdown-them");
          const MAX_CONCURRENT = Math.min(16, Math.max(1, config.get<number>("maxConcurrentConversions", 6)));
          let active = 0;
          let index = 0;
          const queue = [...uris];

          await new Promise<void>((resolve) => {
            const tryNext = () => {
              // Drain the queue while slots are available
              while (active < MAX_CONCURRENT && index < queue.length) {
                const uri = queue[index++];
                active++;

                convertFile(uri.fsPath, false)
                  .then((mdPath) => {
                    vscode.window.showInformationMessage(
                      `Successfully converted: ${path.basename(mdPath)}`,
                    );
                  })
                  .catch((e: any) => {
                    vscode.window.showErrorMessage(
                      `Failed to convert ${path.basename(uri.fsPath)}: ${e.message}`,
                    );
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

  let disposable2 = vscode.commands.registerCommand(
    "markdown-them.convertCurrentToMarkdown",
    async () => {
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
        const doc = await vscode.workspace.openTextDocument({
          content: mdContent,
          language: "markdown",
        });
        await vscode.window.showTextDocument(doc, {
          preview: false,
          viewColumn: vscode.ViewColumn.Beside,
        });
      } catch (e: any) {
        vscode.window.showErrorMessage(
          `Failed to convert ${path.basename(filePath)}: ${e.message}`,
        );
      }
    },
  );

  let disposable3 = vscode.commands.registerCommand(
    "markdown-them.setMaxConcurrentConversions",
    async () => {
      const config = vscode.workspace.getConfiguration("markdown-them");
      const current = config.get<number>("maxConcurrentConversions", 6);

      const input = await vscode.window.showInputBox({
        title: "Set Max Concurrent Conversions",
        prompt: "Number of files converted simultaneously (1 – 16)",
        value: String(current),
        validateInput: (raw) => {
          const n = parseInt(raw, 10);
          if (isNaN(n) || !Number.isInteger(n)) { return "Please enter a whole number."; }
          if (n < 1 || n > 16) { return "Value must be between 1 and 16."; }
          return null;
        },
      });

      if (input === undefined) { return; } // user cancelled

      const value = Math.min(16, Math.max(1, parseInt(input, 10)));
      await config.update(
        "maxConcurrentConversions",
        value,
        vscode.ConfigurationTarget.Global,
      );
      vscode.window.showInformationMessage(
        `Markdown Them: Max concurrent conversions set to ${value}.`,
      );
    },
  );

  context.subscriptions.push(disposable1, disposable2, disposable3);
}

async function convertFile(
  filePath: string,
  inMemory: boolean,
): Promise<string> {
  const mdContent = await generateMarkdown(filePath);
  if (inMemory) {
    return mdContent;
  }
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const basename = path.basename(filePath, ext);
  let newPath = path.join(dir, `${basename}.md`);

  if (ext.toLowerCase() === ".md") {
    newPath = path.join(dir, `${basename}_converted.md`);
  }

  await fs.writeFile(newPath, mdContent, "utf-8");
  return newPath;
}

export function deactivate() {}
