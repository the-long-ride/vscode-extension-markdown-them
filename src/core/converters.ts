import { restoreWorker } from "./polyfill";
import * as path from "path";
import * as fs from "fs/promises";
import { readFileSync } from "fs";
import * as mammoth from "mammoth";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";

const pdf2md = require("@opendocsg/pdf2md");
const TurndownService = require("turndown");
const officeParser = require("officeparser");

restoreWorker();

const turndownService = new TurndownService({ headingStyle: "atx" });
turndownService.remove(["style", "script", "noscript", "meta", "link", "title"]);

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  parseAttributeValue: false,
  parseTagValue: false,
  trimValues: false,
});

export async function generateMarkdown(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".docx": {
      const result = await mammoth.convertToHtml({ path: filePath });
      return turndownService.turndown(result.value);
    }
    case ".html": {
      const htmlContent = await fs.readFile(filePath, "utf-8");
      return turndownService.turndown(htmlContent);
    }
    case ".pdf": {
      const dataBuffer = readFileSync(filePath);
      return await pdf2md(dataBuffer);
    }
    case ".xlsx":
      return await convertXlsx(filePath);
    case ".pptx":
    case ".odt":
    case ".odp":
    case ".ods":
    case ".rtf": {
      const officeResult: unknown = await officeParser.parseOffice(filePath);
      return officeAstToMarkdown(officeResult as any);
    }
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}

export async function convertFileToMarkdown(filePath: string, outputPath?: string): Promise<string> {
  const mdContent = await generateMarkdown(filePath);

  if (!outputPath) {
    outputPath = inferOutputPath(filePath);
  }

  await fs.writeFile(outputPath, mdContent, "utf-8");
  return outputPath;
}

export function inferOutputPath(filePath: string): string {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const basename = path.basename(filePath, ext);
  return path.join(dir, ext.toLowerCase() === ".md" ? `${basename}_converted.md` : `${basename}.md`);
}

async function convertXlsx(filePath: string): Promise<string> {
  const data = await fs.readFile(filePath);
  const zip = await JSZip.loadAsync(data);
  const workbookXml = await readZipText(zip, "xl/workbook.xml");

  if (!workbookXml) {
    throw new Error("Invalid XLSX file: missing workbook.xml");
  }

  const workbook = xmlParser.parse(workbookXml);
  const relationships = await readWorkbookRelationships(zip);
  const sharedStrings = await readSharedStrings(zip);
  const sheets = toArray(workbook?.workbook?.sheets?.sheet);

  let md = "";

  for (const sheet of sheets) {
    const sheetName = String(sheet?.["@_name"] || "Sheet");
    const relationshipId = sheet?.["@_r:id"];
    const sheetPath = relationshipId ? relationships.get(String(relationshipId)) : undefined;

    md += `## ${sheetName}\n\n`;

    if (!sheetPath) {
      md += "\n";
      continue;
    }

    const worksheetXml = await readZipText(zip, sheetPath);
    if (!worksheetXml) {
      md += "\n";
      continue;
    }

    const worksheet = xmlParser.parse(worksheetXml);
    const rows = toArray(worksheet?.worksheet?.sheetData?.row);

    rows.forEach((row, rowIndex) => {
      const rowData = readXlsxRow(row, sharedStrings);
      md += "| " + rowData.join(" | ") + " |\n";

      if (rowIndex === 0) {
        md += "|" + rowData.map(() => "---").join("|") + "|\n";
      }
    });
    md += "\n";
  }

  return md;
}

async function readWorkbookRelationships(zip: JSZip): Promise<Map<string, string>> {
  const relationships = new Map<string, string>();
  const relsXml = await readZipText(zip, "xl/_rels/workbook.xml.rels");

  if (!relsXml) {
    return relationships;
  }

  const rels = xmlParser.parse(relsXml);
  for (const relationship of toArray(rels?.Relationships?.Relationship)) {
    const id = relationship?.["@_Id"];
    const target = relationship?.["@_Target"];

    if (id && target) {
      relationships.set(String(id), resolveWorkbookTarget(String(target)));
    }
  }

  return relationships;
}

async function readSharedStrings(zip: JSZip): Promise<string[]> {
  const sharedStringsXml = await readZipText(zip, "xl/sharedStrings.xml");

  if (!sharedStringsXml) {
    return [];
  }

  const sharedStrings = xmlParser.parse(sharedStringsXml);
  return toArray(sharedStrings?.sst?.si).map(readRichText);
}

async function readZipText(zip: JSZip, filePath: string): Promise<string | undefined> {
  const file = zip.file(filePath);
  return file ? file.async("text") : undefined;
}

function readXlsxRow(row: any, sharedStrings: string[]): string[] {
  const values: string[] = [];
  let nextColumn = 1;

  for (const cell of toArray(row?.c)) {
    const cellRef = cell?.["@_r"];
    const column = cellRef ? columnIndexFromCellRef(String(cellRef)) : nextColumn;

    while (values.length < column - 1) {
      values.push("");
    }

    values.push(readXlsxCell(cell, sharedStrings).replace(/\r?\n/g, " "));
    nextColumn = column + 1;
  }

  return values;
}

function readXlsxCell(cell: any, sharedStrings: string[]): string {
  const type = cell?.["@_t"];

  if (type === "inlineStr") {
    return readRichText(cell?.is);
  }

  const rawValue = readRichText(cell?.v);

  if (type === "s") {
    return sharedStrings[parseInt(rawValue, 10)] || "";
  }

  if (type === "b") {
    return rawValue === "1" ? "TRUE" : "FALSE";
  }

  return rawValue;
}

function readRichText(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(readRichText).join("");
  }

  if (value.t !== undefined) {
    return readRichText(value.t);
  }

  if (value.r !== undefined) {
    return toArray(value.r).map((run) => readRichText(run.t)).join("");
  }

  if (value["#text"] !== undefined) {
    return String(value["#text"]);
  }

  return "";
}

function resolveWorkbookTarget(target: string): string {
  const normalized = target.replace(/\\/g, "/");

  if (normalized.startsWith("/")) {
    return normalized.replace(/^\/+/, "");
  }

  return path.posix.normalize(path.posix.join("xl", normalized));
}

function columnIndexFromCellRef(cellRef: string): number {
  const columnLetters = cellRef.match(/^[A-Z]+/i)?.[0]?.toUpperCase() || "A";

  return columnLetters.split("").reduce((index, char) => {
    return index * 26 + char.charCodeAt(0) - 64;
  }, 0);
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function officeAstToMarkdown(ast: any): string {
  if (!ast || !ast.content || !Array.isArray(ast.content)) {
    return typeof ast?.toText === "function" ? ast.toText() : JSON.stringify(ast, null, 2);
  }

  let markdown = "";

  function processFormatting(text: string, formatting?: any): string {
    if (!text) {
      return text;
    }

    let result = text;
    if (formatting?.bold) {
      result = `**${result}**`;
    }
    if (formatting?.italic) {
      result = `*${result}*`;
    }
    if (formatting?.strikethrough) {
      result = `~~${result}~~`;
    }

    return result;
  }

  function safeGetText(node: any): string {
    try {
      return node.text ? String(node.text) : "";
    } catch {
      return "";
    }
  }

  function processNode(node: any): string {
    if (!node) {
      return "";
    }

    switch (node.type) {
      case "text":
        return processFormatting(safeGetText(node), node.formatting);
      case "paragraph": {
        const pText = (node.children || []).map(processNode).join("");
        const sizeStr = node.children?.[0]?.formatting?.size;
        if (sizeStr) {
          const sizeMatch = String(sizeStr).match(/(\d+)/);
          if (sizeMatch) {
            const size = parseInt(sizeMatch[1], 10);
            if (size >= 36) {
              return `\n# ${pText}\n`;
            }
            if (size >= 24) {
              return `\n## ${pText}\n`;
            }
            if (size >= 18) {
              return `\n### ${pText}\n`;
            }
          }
        }

        return `\n${pText}\n`;
      }
      case "image":
        return "";
      case "slide": {
        const slideContent = (node.children || []).map(processNode).join("").trim();
        return `\n---\n\n${slideContent}\n`;
      }
      case "table": {
        if (!node.children || node.children.length === 0) {
          return "";
        }

        let tableMd = "\n";
        node.children.forEach((row: any, i: number) => {
          tableMd += processNode(row);
          if (i === 0) {
            const cellCount = row.children?.length || 0;
            tableMd += "|" + "---|".repeat(cellCount) + "\n";
          }
        });

        return tableMd + "\n";
      }
      case "row":
        return "| " + (node.children || []).map(processNode).join(" | ") + " |\n";
      case "cell":
        return (node.children || []).map(processNode).join(" ").replace(/\n/g, " ").trim();
      default:
        if (node.children) {
          return node.children.map(processNode).join("");
        }
        return safeGetText(node);
    }
  }

  ast.content.forEach((node: any) => {
    markdown += processNode(node);
  });

  return markdown.replace(/\n{3,}/g, "\n\n").trim();
}
