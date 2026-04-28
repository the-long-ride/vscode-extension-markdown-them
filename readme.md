<p align="center">
  <img src="https://raw.githubusercontent.com/the-long-ride/vscode-extension-markdown-them/main/assets/markdown-them-logo.png" width="128" alt="Markdown Them Logo">
</p>

# Markdown Them

Convert various document files (docx, pdf, html, xlsx, pptx, odt, odp, ods, rtf) into Markdown (.md) seamlessly inside Visual Studio Code.

## Features

- **Convert Multiple Files:** Select one or multiple files in the Explorer, right-click, and choose "Convert to Markdown".
- **Convert Active File:** Hit `Ctrl+M Ctrl+D` (or `Cmd+M Cmd+D` on Mac) while a file is open to generate a markdown preview.

> [!NOTE]
> Currently, `.pptx` and other office formats (`.odt`, `.odp`, `.ods`, `.rtf`) extract text and tables only; images are ignored to keep output files lightweight & easier to read.

## Safely Powered By

We care about security and avoid packages with known vulnerabilities (e.g. `xlsx` or `markdown-it`). 
Special thanks to the open-source authors and contributors whose incredible libraries power this extension:

- [`mammoth`](https://github.com/mwilliamson/mammoth.js): Robust conversion of `.docx` documents.
- [`@opendocsg/pdf2md`](https://github.com/opengovsg/pdf2md): Reliable text extraction from `.pdf` files.
- [`exceljs`](https://github.com/exceljs/exceljs): Safe parsing of `.xlsx` files into structured markdown tables.
- [`turndown`](https://github.com/mixmark-io/turndown): Converting `.html` files (or mammoth's HTML output) cleanly to Markdown.
- [`officeparser`](https://github.com/harshankur/officeParser): A fallback text extractor for `.pptx`, `.odt`, `.odp`, `.ods`, and `.rtf` files.

## Credits & Links
[GitHub Repository](https://github.com/the-long-ride/vscode-extension-markdown-them) | [Changelog](https://github.com/the-long-ride/vscode-extension-markdown-them/blob/main/changelog.md) | [Contribution Guidelines](https://github.com/the-long-ride/vscode-extension-markdown-them/blob/main/guideline.md)

## License
[MIT](https://github.com/the-long-ride/vscode-extension-markdown-them/blob/main/LICENSE)

