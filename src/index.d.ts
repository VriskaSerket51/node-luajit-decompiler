export declare function decompile(filePath: string | Uint8Array): string;
export interface DecompileOptions {
  /** Reject after this many milliseconds; 0 disables the timeout. */
  timeout?: number;
  signal?: AbortSignal;
}
/** Run the native decompiler on a worker thread. */
export declare function decompileAsync(filePath: string | Uint8Array, options?: DecompileOptions): Promise<string>;
