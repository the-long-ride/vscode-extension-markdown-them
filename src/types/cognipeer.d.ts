declare module '@cognipeer/to-markdown' {
    export interface ConverterOptions {
        fileName?: string;
        outputDir?: string;
        [key: string]: any;
    }

    export function convertToMarkdown(input: string | Buffer, options?: ConverterOptions): Promise<string>;
    export function saveToMarkdownFile(content: string, fileName: string, outputDir?: string): Promise<string>;
    
    const _default: {
        convertToMarkdown: typeof convertToMarkdown;
        saveToMarkdownFile: typeof saveToMarkdownFile;
    };
    export default _default;
}
