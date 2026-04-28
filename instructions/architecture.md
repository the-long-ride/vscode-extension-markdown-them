# Architecture & Flow

The `markdown-them` extension converts various document types to markdown. 

## Key Components

1. **Commands**
   - `markdown-them.convertToMarkdown`: Context menu action. Retrieves URIs and iterates through them.
   - `markdown-them.convertCurrentToMarkdown`: Keyboard shortcut (`Ctrl+M D`). Retrieves active text editor or active tab URI and converts it to an in-memory markdown document displayed beside the original file.

2. **Core Logic (`src/extension.ts`)**
   - `convertFile(filePath, inMemory)`: Controls whether the result is saved to a file (`_converted.md` if source was `.md`, otherwise `.md`) or returned as a string.
   - `generateMarkdown(filePath)`: The router that directs processing based on the file extension.

3. **Conversion Libraries**
   - `.docx`: `mammoth.convertToHtml` -> `turndown`
   - `.html`: File read -> `turndown`
   - `.pdf`: `@opendocsg/pdf2md`
   - `.xlsx`: `exceljs` -> manual parsing to Markdown Tables
   - `.pptx`, `.odt`, `.odp`, `.ods`, `.rtf`: `officeparser.parseOffice`
