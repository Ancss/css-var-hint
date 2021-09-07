import { workspace } from 'vscode';
import { EXTENSION_NAME, FilesData } from './constants';
import { readFile, stat } from 'fs';
import { promisify } from 'util';
import { join, resolve } from 'path';

const readFileAsync = promisify(readFile);
const statAsync = promisify(stat);

export async function getFilesData(): Promise<FilesData> {
  if (!workspace.workspaceFolders) {
    throw Error('not fount workspace');
  }
  const files = getConfigFiles();
  const workspaceFolder = workspace.workspaceFolders || [];
  const folderPath = workspaceFolder[0]?.uri.fsPath;
  const filesData: FilesData = {};
  if (files.length > 0) {
    for (let filePath of files) {
      const path = join(folderPath, filePath);
      const isFile = (await statAsync(path)).isFile();
      if (isFile) {
        const file = await readFileAsync(path);
        filesData[path] = file.toString('utf-8');
      }

    }
  }
  return filesData;
}

export function getConfigFiles(): string[] {
  const config = workspace.getConfiguration(EXTENSION_NAME);
  let files: string[] = [];
  if (config && config.has('files')) {
    files = config.get('files')!;
  }
  return files;
}
