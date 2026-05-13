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

To publish the extension, it is highly recommended to package it into a `.vsix` file first. This ensures the artifact remains identical across different registries and minimizes issues with local file configuration.

### 1. Prerequisites

Install the official `vsce` tool globally, which is needed to package the extension:

```bash
npm install -g @vscode/vsce
```

### 2. Step 1: Package the Extension

This bundles your extension and packages it into a single `.vsix` file (e.g., `markdown-them-x.x.x.vsix`):

```bash
vsce package
```

### 3. Step 2: Publish to VS Code Marketplace
> *PAT: personal access token*

You can publish the packaged extension directly from your terminal:

```bash
vsce publish -p <YOUR_VS_CODE_MARKETPLACE_PAT>
```

Alternatively, you can manually upload the `.vsix` file generated in Step 1 to the [Visual Studio Marketplace Management Dashboard](https://marketplace.visualstudio.com/manage).

### 4. Step 3: Publish to Open VSX Registry

To publish to [open-vsx.org](https://open-vsx.org/), it is best practice to publish the `.vsix` package directly using `ovsx`:

```bash
npx ovsx publish ./markdown-them-<version>.vsix -p <YOUR_OPEN_VSX_PAT>
```

### Useful Links

- [Official VS Code Publishing Docs](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Open VSX Registry Wiki / Publishing Guide](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)

