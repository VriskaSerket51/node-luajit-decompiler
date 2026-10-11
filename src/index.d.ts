export declare function decompile(filePath: string): string;
export interface DecompileOptions {
  /** Reject after this many milliseconds; 0 disables the timeout. */
  timeout?: number;
  signal?: AbortSignal;
}
/** Run the native decompiler on a worker thread. */
export declare function decompileAsync(filePath: string, options?: DecompileOptions): Promise<string>;
