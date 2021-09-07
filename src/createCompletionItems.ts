import { CompletionItem, CompletionItemKind } from "vscode";
import { Vars } from "./constants";


export function createCompletionItems(vars: Vars[]): CompletionItem[] {
  const items: CompletionItem[] = [];
  vars.forEach((cssVar: Vars) => {
    const item = new CompletionItem(cssVar.prop, CompletionItemKind.Variable);
    // item.insertText = cssVar.value + cssVar.params;
    item.insertText = cssVar.prop;
    item.detail = `${cssVar.filePath} ${cssVar.row}:${cssVar.column}`;
    const value = cssVar.value + cssVar.params;
    item.documentation = `
      ${cssVar.prop} : ${value}
    `;
    items.push(item);
  });
  return items;
}
