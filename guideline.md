# Developer Guidelines

Welcome to the `markdown-them` project! This guideline will help you get started with the codebase and debugging.

## Getting Started

1. **Install Dependencies:**
   Run `npm install` to install all necessary packages.
   
2. **Compile the Extension:**
   Run `npm run compile` to build the typescript files once, or `npm run watch` to watch for changes.

## Debugging

The `.vscode/launch.json` and `.vscode/tasks.json` have been configured to make debugging seamless.
- Simply press **F5** in VS Code.
- This will automatically trigger the `npm: watch` task, compile your TypeScript code, and open a new Extension Development Host window.
- In the new window, you can test the context menus and the keyboard shortcuts. Breakpoints placed in `src/extension.ts` will hit successfully.

## Code Structure

- `src/extension.ts`: The main entry point. Contains the command registrations and the core mapping logic.
- `package.json`: Holds the extension manifest, configuration, and activation events.

## Adding Support for New File Types

If you want to add support for a new file type:
1. Update the `when` clause in `package.json` under `menus.explorer/context` to include the new extension.
2. Update the `switch` statement in `src/extension.ts` (`generateMarkdown` function).
3. Use a safe parsing library.

## Publishing

To publish the extension to the VS Code Marketplace, follow these steps:

1.  **Install vsce:**
    `vsce` (Visual Studio Code Extensions) is the command-line tool for packaging and publishing.
    ```bash
    npm install -g @vscode/vsce
    ```

2.  **Package the Extension:**
    This creates a `.vsix` file for testing or manual installation.
    ```bash
    vsce package
    ```

3. **Publish to marketplace:**
There are many ways to do this, I give you the link to study how:

[https://code.visualstudio.com/api/working-with-extensions/publishing-extension](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

