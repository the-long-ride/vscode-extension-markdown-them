# Architecture & Flow

The `markdown-them` extension converts various document types to markdown. 

## Key Components

1. **Commands**
   - `markdown-them.convertToMarkdown`: Context menu action. Retrieves URIs and processes them **concurrently** using a semaphore-style queue.
   - `markdown-them.convertCurrentToMarkdown`: Keyboard shortcut (`Ctrl+M D`). Retrieves active text editor or active tab URI and converts it to an in-memory markdown document displayed beside the original file.
   - `markdown-them.setMaxConcurrentConversions`: Command palette action. Allows users to interactively update the concurrency limit (1-16) which is stored in VS Code configuration.

2. **Source Layout**
   - `src/core`: Shared conversion code used by both publish targets.
   - `src/vscode`: VS Code-specific commands, progress notifications, settings, and editor integration.
   - `src/nodejs-package`: Public Node.js package entry point.
   - `nodejs-package`: npm package metadata, docs, license, and generated `dist` output.

3. **Core Logic (`src/core/converters.ts`)**
   - `generateMarkdown(filePath)`: The router that directs processing based on the file extension.
   - `convertFileToMarkdown(filePath, outputPath?)`: Saves generated markdown to disk.
   - `inferOutputPath(filePath)`: Calculates the default sibling `.md` output path.

4. **VS Code Logic (`src/vscode/extension.ts`)**
   - **Concurrency Management**: Uses a custom asynchronous queue in the `withProgress` handler to cap active conversions at `MAX_CONCURRENT` (default: 6). This prevents system resource exhaustion during large batch operations while providing faster total completion time compared to sequential processing.
   - Batch conversion calls the shared `convertFileToMarkdown` helper.
   - Active-file preview calls the shared `generateMarkdown` helper and displays the result in an in-memory Markdown document.

5. **Conversion Libraries**
   - `.docx`: `mammoth.convertToHtml` -> `turndown`
   - `.html`: File read -> `turndown`
   - `.pdf`: `@opendocsg/pdf2md`
   - `.xlsx`: `jszip` + `fast-xml-parser` -> manual parsing to Markdown tables
   - `.pptx`, `.odt`, `.odp`, `.ods`, `.rtf`: `officeparser.parseOffice`
