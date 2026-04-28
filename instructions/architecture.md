# Architecture & Flow

The `markdown-them` extension converts various document types to markdown. 

## Key Components

1. **Commands**
   - `markdown-them.convertToMarkdown`: Context menu action. Retrieves URIs and processes them **concurrently** using a semaphore-style queue.
   - `markdown-them.convertCurrentToMarkdown`: Keyboard shortcut (`Ctrl+M D`). Retrieves active text editor or active tab URI and converts it to an in-memory markdown document displayed beside the original file.
   - `markdown-them.setMaxConcurrentConversions`: Command palette action. Allows users to interactively update the concurrency limit (1-16) which is stored in VS Code configuration.

2. **Core Logic (`src/extension.ts`)**
   - **Concurrency Management**: Uses a custom asynchronous queue in the `withProgress` handler to cap active conversions at `MAX_CONCURRENT` (default: 6). This prevents system resource exhaustion during large batch operations while providing faster total completion time compared to sequential processing.
   - `convertFile(filePath, inMemory)`: Controls whether the result is saved to a file (`_converted.md` if source was `.md`, otherwise `.md`) or returned as a string.
   - `generateMarkdown(filePath)`: The router that directs processing based on the file extension.

3. **Conversion Libraries**
   - `.docx`: `mammoth.convertToHtml` -> `turndown`
   - `.html`: File read -> `turndown`
   - `.pdf`: `@opendocsg/pdf2md`
   - `.xlsx`: `exceljs` -> manual parsing to Markdown Tables
   - `.pptx`, `.odt`, `.odp`, `.ods`, `.rtf`: `officeparser.parseOffice`
