# @the-long-ride/markdown-them

Node.js package for converting documents to Markdown.

## Install

```bash
npm i @the-long-ride/markdown-them
# or
pnpm add @the-long-ride/markdown-them
```

## Usage

```ts
import {
  convertFileToMarkdown,
  generateMarkdown,
  inferOutputPath,
} from "@the-long-ride/markdown-them";

// Save output to sibling .md file
const outputPath = await convertFileToMarkdown("./docs/report.docx");

// Return markdown text without writing to disk
const markdown = await generateMarkdown("./docs/report.docx");

// Preview the default destination path
const defaultOutputPath = inferOutputPath("./docs/report.docx");

console.log(outputPath, defaultOutputPath, markdown.slice(0, 120));
```

## Supported extensions

`.docx`, `.pdf`, `.html`, `.xlsx`, `.pptx`, `.odt`, `.odp`, `.ods`, `.rtf`.
