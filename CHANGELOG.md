# Changelog

All notable changes to the "markdown-them" extension will be documented in this file.

## [1.1.0] - 2026-04-28
- **New setting:** `markdown-them.maxConcurrentConversions` — control how many files are converted at the same time when using "Convert to Markdown" (range: 1–16, default: 6).
- **New command:** `Markdown Them: Set Max Concurrent Conversions` — open an interactive input box from the Command Palette to change the concurrency limit on the fly.
- Batch conversions now run concurrently instead of sequentially, significantly reducing total conversion time for large selections.

## [1.0.0] - Initial Release
- Support conversion for `.docx`, `.pdf`, `.html`, `.xlsx`, `.pptx`, `.odt`, `.odp`, `.ods`, `.rtf` files.
- Command: `Convert to Markdown` from Explorer context menu.
- Command: `Convert Current File to Markdown` via `Ctrl+M Ctrl+D`.
- Removed unsafe dependencies and replaced them with robust alternatives (`mammoth`, `pdf-parse`, `exceljs`, `turndown`, `officeparser`).
