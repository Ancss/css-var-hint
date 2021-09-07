export const EXTENSION_NAME = 'cssVarHint';

export type FilesData = {
  [k in string]: string
};
export const supportExtensionNames = ["css", "less", "scss", "vue"] as const;
export type SupportExtensionNames = typeof supportExtensionNames[number];

export const RULE_TYPE = 'rule';
export const DECL_TYPE = 'decl';
export const LESS_TYPE = 'atrule';

export interface Vars {
  prop: string,
  params?: string,
  value: string,
  row: number,
  column: number,
  filePath: string,
}
export const triggedStrs = ['-', '$', '@'];
