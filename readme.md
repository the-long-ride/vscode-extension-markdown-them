<p align="center">
  <img src="https://raw.githubusercontent.com/the-long-ride/vscode-extension-markdown-them/main/assets/markdown-them-logo.png" width="128" alt="Markdown Them Logo">
</p>

# Markdown Them

Convert various document files into Markdown (.md) seamlessly inside Visual Studio Code.
 
- **Supported formats:** `.docx`, `.pdf`, `.html`, `.xlsx`, `.pptx`, `.odt`, `.odp`, `.ods`, `.rtf`.
- **Concurrent batch processing:** Convert dozens of files at once with optimized performance.
- **Preview mode:** Instantly view converted markdown for your active document.

## Usage

### 1. Convert Multiple Files (Batch)
1. In the **Explorer** side bar, select one or more files.
2. Right-click and choose **Convert to Markdown**.
3. Files will be converted **concurrently** (up to the defined limit). You'll see notifications as each file completes.

### 2. Convert Active File
- While viewing a document, press `Ctrl+M Ctrl+D` (or `Cmd+M Cmd+D` on Mac).
- A markdown preview will open in a new pane beside your current editor.

### 3. Change Concurrency Limit
- Use the command palette (`Ctrl+Shift+P`) and search for **Markdown Them: Set Max Concurrent Conversions**.
- Or, go to **File > Preferences > Settings** and search for `Markdown Them`.

> [!NOTE]
> Currently, `.pptx` and other office formats (`.odt`, `.odp`, `.ods`, `.rtf`) extract text and tables only; images are ignored to keep output files lightweight & easier to read.

## Configuration

| Setting | Type | Default | Range | Description |
|---|---|---|---|---|
| `markdown-them.maxConcurrentConversions` | `integer` | `6` | `1` – `16` | Maximum number of files converted simultaneously during a batch "Convert to Markdown" operation. |

You can change this in three ways:

**1. Command Palette** — Run `Markdown Them: Set Max Concurrent Conversions` (`Ctrl+Shift+P`) to get an interactive input box pre-filled with the current value.

**2. Settings UI** — Open **Settings** (`Ctrl+,`) and search for `Markdown Them`.

**3. `settings.json`** — Add the key directly:

```jsonc
{
  // Convert up to 4 files at the same time
  "markdown-them.maxConcurrentConversions": 4
}
```

## Safely Powered By

We care about security and avoid packages with known vulnerabilities (e.g. `xlsx` or `markdown-it`). 
Special thanks to the open-source authors and contributors whose incredible libraries power this extension:

- [`mammoth`](https://github.com/mwilliamson/mammoth.js): Robust conversion of `.docx` documents.
- [`@opendocsg/pdf2md`](https://github.com/opengovsg/pdf2md): Reliable text extraction from `.pdf` files.
- [`exceljs`](https://github.com/exceljs/exceljs): Safe parsing of `.xlsx` files into structured markdown tables.
- [`turndown`](https://github.com/mixmark-io/turndown): Converting `.html` files (or mammoth's HTML output) cleanly to Markdown.
- [`officeparser`](https://github.com/harshankur/officeParser): A fallback text extractor for `.pptx`, `.odt`, `.odp`, `.ods`, and `.rtf` files.

## Credits & Links
[VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=the-long-ride.markdown-them) 
| [Open VSX](https://open-vsx.org/extension/the-long-ride/markdown-them) 
| [GitHub Repository](https://github.com/the-long-ride/vscode-extension-markdown-them) 
| [Changelog](https://github.com/the-long-ride/vscode-extension-markdown-them/blob/main/CHANGELOG.md) 
| [Contribution Guidelines](https://github.com/the-long-ride/vscode-extension-markdown-them/blob/main/GUIDELINE.md)

## License
[MIT](https://github.com/the-long-ride/vscode-extension-markdown-them/blob/main/LICENSE)

