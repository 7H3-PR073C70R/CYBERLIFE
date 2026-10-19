/**
 * Cyberlife — Virtual Filesystem Domain Types
 *
 * Exclusively synthetic in-memory filesystem for the fictional security workstation.
 * Strict isolation: zero access to browser storage, local machine, environment, or real OS.
 */

export type FileType = 'file' | 'directory';

export interface VirtualFileEntry {
  readonly name: string;
  readonly path: string;
  readonly type: FileType;
  readonly sizeBytes: number;
  readonly permissions: string; // e.g. '-rw-r--r--' or 'drwxr-xr-x'
  readonly owner: string;
  readonly group: string;
  readonly modifiedDate: string;
  readonly readOnly: boolean;
  readonly description?: string;
  readonly content?: string; // Text content for files
}

export interface VirtualDirectory {
  readonly path: string;
  readonly name: string;
  readonly permissions: string;
  readonly owner: string;
  readonly group: string;
  readonly modifiedDate: string;
  readonly children: readonly VirtualFileEntry[];
}

export interface FileOperationResult {
  readonly success: boolean;
  readonly message?: string;
  readonly error?: string;
  readonly entry?: VirtualFileEntry;
}
