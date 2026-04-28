# Setup & Debugging

## Environment
- **Node.js**: Recommended latest LTS.
- **TypeScript**: Configured via `tsconfig.json` using CommonJS module system for VS Code compatibility.

## Debugging

1. Ensure packages are installed via `npm install`.
2. Open the project in VS Code.
3. Press `F5`. This executes the configuration in `.vscode/launch.json`.
4. The task `npm: watch` in `.vscode/tasks.json` starts the TypeScript compiler in watch mode automatically.
5. An Extension Development Host will launch.
6. Test context menus by right-clicking on files or test shortcuts (`Ctrl+M D`). Breakpoints in `src/extension.ts` will trigger.
