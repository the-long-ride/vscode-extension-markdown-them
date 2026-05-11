import { restoreWorker } from './polyfill';
import * as path from "path";
import * as fs from "fs/promises";
import { readFileSync } from "fs";
import * as mammoth from "mammoth";
import * as exceljs from "exceljs";

const pdf2md = require('@opendocsg/pdf2md');
const TurndownService = require("turndown");
const officeParser = require("officeparser");

restoreWorker();

const turndownService = new TurndownService({ headingStyle: "atx" });
turndownService.remove([
  "style",
  "script",
  "noscript",
  "meta",
  "link",
  "title",
]);

export async function generateMarkdown(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".docx":
      const result = await mammoth.convertToHtml({ path: filePath });
      return turndownService.turndown(result.value);
    case ".html":
      const htmlContent = await fs.readFile(filePath, "utf-8");
      return turndownService.turndown(htmlContent);
    case '.pdf':
      const dataBuffer = readFileSync(filePath);
      return await pdf2md(dataBuffer);
    case ".xlsx":
      return await convertXlsx(filePath);
    case ".pptx":
    case ".odt":
    case ".odp":
    case ".ods":
    case ".rtf":
      const officeResult: any = await officeParser.parseOffice(filePath);
      return officeAstToMarkdown(officeResult);
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}

async function convertXlsx(filePath: string): Promise<string> {
  const workbook = new exceljs.Workbook();
  await workbook.xlsx.readFile(filePath);
  let md = "";
  workbook.eachSheet((worksheet, sheetId) => {
    md += `## ${worksheet.name}\n\n`;
    worksheet.eachRow((row, rowNumber) => {
      let rowData: any[] = [];
      row.eachCell({ includeEmpty: true }, (cell) => {
        let cellText = "";
        try {
          cellText = cell.text || "";
        } catch (err) {
          if (cell.value !== null && cell.value !== undefined) {
            if (typeof cell.value === "object") {
              if ("result" in (cell.value as any)) {
                cellText = String((cell.value as any).result || "");
              } else if (cell.value instanceof Date) {
                cellText = cell.value.toISOString();
              } else if ("error" in (cell.value as any)) {
                cellText = String((cell.value as any).error || "");
              } else {
                try {
                  cellText = JSON.stringify(cell.value);
                } catch {
                  cellText = String(cell.value);
                }
              }
            } else {
              cellText = String(cell.value);
            }
          }
        }
        rowData.push(cellText.replace(/\r?\n/g, " "));
      });
      md += "| " + rowData.join(" | ") + " |\n";
      if (rowNumber === 1) {
        md += "|" + rowData.map(() => "---").join("|") + "|\n";
      }
    });
    md += "\n";
  });
  return md;
}

function officeAstToMarkdown(ast: any): string {
    if (!ast || !ast.content || !Array.isArray(ast.content)) {
        return typeof ast?.toText === 'function' ? ast.toText() : JSON.stringify(ast, null, 2);
    }

    let markdown = '';

    function processFormatting(text: string, formatting?: any): string {
        if (!text) return text;
        let res = text;
        if (formatting?.bold) res = `**${res}**`;
        if (formatting?.italic) res = `*${res}*`;
        if (formatting?.strikethrough) res = `~~${res}~~`;
        return res;
    }

    function safeGetText(node: any): string {
        try {
            return node.text ? String(node.text) : '';
        } catch {
            return '';
        }
    }

    function processNode(node: any): string {
        if (!node) return '';

        switch (node.type) {
            case 'text':
                return processFormatting(safeGetText(node), node.formatting);
            case 'paragraph':
                const pText = (node.children || []).map(processNode).join('');
                const sizeStr = node.children?.[0]?.formatting?.size;
                if (sizeStr) {
                    const sizeMatch = String(sizeStr).match(/(\d+)/);
                    if (sizeMatch) {
                        const size = parseInt(sizeMatch[1]);
                        if (size >= 36) return `\n# ${pText}\n`;
                        if (size >= 24) return `\n## ${pText}\n`;
                        if (size >= 18) return `\n### ${pText}\n`;
                    }
                }
                return `\n${pText}\n`;
            case 'image':
                return ''; // Ignore all images for now
            case 'slide':
                const slideContent = (node.children || []).map(processNode).join('').trim();
                return `\n---\n\n${slideContent}\n`;
            case 'table':
                if (!node.children || node.children.length === 0) return '';
                let tableMd = '\n';
                node.children.forEach((row: any, i: number) => {
                    tableMd += processNode(row);
                    if (i === 0) {
                        const cellCount = row.children?.length || 0;
                        tableMd += '|' + '---|'.repeat(cellCount) + '\n';
                    }
                });
                return tableMd + '\n';
            case 'row':
                return '| ' + (node.children || []).map(processNode).join(' | ') + ' |\n';
            case 'cell':
                return (node.children || []).map(processNode).join(' ').replace(/\n/g, ' ').trim();
            default:
                if (node.children) {
                    return node.children.map(processNode).join('');
                }
                return safeGetText(node);
        }
    }

    ast.content.forEach((node: any) => {
        markdown += processNode(node);
    });

    return markdown.replace(/\n{3,}/g, '\n\n').trim();
}
