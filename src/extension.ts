import { languages, ExtensionContext, CompletionList, CompletionItem, Position, Range, window, TextEdit, Selection, CodeAction } from 'vscode';
import { getFilesData } from './getconfig';
import { pushVarsByFileData } from './pushVars';
import { supportExtensionNames, SupportExtensionNames, triggedStrs, Vars } from './constants';
import { createCompletionItems } from './createCompletionItems';
import { createFix } from './createFix';

export async function activate(context: ExtensionContext) {
  let filesData = await getFilesData();
  let fileKeys = Object.keys(filesData);

  context.subscriptions.push(languages.registerCompletionItemProvider(supportExtensionNames, {
    async provideCompletionItems(document, position) {
      const firstInLine = new Position(position.line, 0);
      const range = new Range(firstInLine, position);
      const textFromStart = document.getText(range) || "";
      const triggedStr = textFromStart[position.character - 1];
      console.log(document.uri);
      // new TextEdit.delete()
      if (!triggedStrs.includes(triggedStr)) {
        return;
      }
      // 可能文件有变动，进行刷新
      filesData = await getFilesData();
      fileKeys = Object.keys(filesData);
      const completionItems: CompletionItem[] = [];
      for (let key of fileKeys) {
        const { cssVars, lessVars, scssVars } = await pushVarsByFileData(key, filesData[key]);
        if (triggedStr === '-') {
          completionItems.push(...createCompletionItems(cssVars));
        } else if (triggedStr === '$') {
          completionItems.push(...createCompletionItems(scssVars));
        } else if (triggedStr === '@') {
          completionItems.push(...createCompletionItems(lessVars));
        }
      }
      return new CompletionList(completionItems);
    }
  }, '-', '$', '@'));
  context.subscriptions.push(languages.registerCodeActionsProvider(supportExtensionNames, {
    async provideCodeActions(document, range) {
      const editor = window.activeTextEditor;
      const replaceWithCssVarsFix: CodeAction[] = [];
      if (editor) {
        const document = editor.document;
        const selection = editor.selection;
        const word = document.getText(selection);
        filesData = await getFilesData();
        fileKeys = Object.keys(filesData);
        for (let key of fileKeys) {
          const { cssVars, lessVars, scssVars } = await pushVarsByFileData(key, filesData[key]);
          const vars = [...cssVars, ...lessVars, ...scssVars];
          vars.forEach(cssVar => {
            const value = cssVar.value + cssVar.params;
            if (word.trim() === value) {
              replaceWithCssVarsFix.push(createFix(document, range, word, cssVar.prop));
            }
          });
        }

      }
      return replaceWithCssVarsFix;
    }
  }));
}

// this method is called when your extension is deactivated
export function deactivate() { }
