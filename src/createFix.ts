import { TextDocument, Range, CodeAction, CodeActionKind, WorkspaceEdit } from "vscode";



export function createFix(document: TextDocument, range: Range, word: string, prop: string): CodeAction {
  const fix = new CodeAction(`Replace ${word} with ${prop}`, CodeActionKind.QuickFix);
  fix.edit = new WorkspaceEdit();
  fix.edit.replace(document.uri, new Range(range.start, range.start.translate(0, word.length)), prop);
  return fix;
}
