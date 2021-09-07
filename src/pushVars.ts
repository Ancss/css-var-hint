import postcss, { AtRule, Declaration, Node, Rule } from 'postcss';
import { LESS_TYPE, DECL_TYPE, Vars, RULE_TYPE } from './constants';
import { window } from 'vscode';
import { basename, extname } from 'path';
export const isNodeType = <T extends Node>(
  node: Node,
  type: string
): node is T => {
  return node.type === type;
};
export async function pushVarsByFileData(key: string, file: string) {
  const cssVars: Vars[] = [];
  const lessVars: Vars[] = [];
  const scssVars: Vars[] = [];
  let res = null;
  try {
    res = await postcss([]).process(file, {
      from: undefined,
    });
  } catch (error) {
    const extName = extname(basename(key));
    if (extName === 'vue') {
      window.showErrorMessage(`暂不支持解析${key}文件中的style`);
    } else {
      window.showErrorMessage(`解析${key}文件失败`);
    }
  }
  if (res !== null) {
    for (let node of res.root.nodes) {
      if (isNodeType<Declaration>(node, DECL_TYPE) || isNodeType<AtRule>(node, LESS_TYPE)) {
        pushVar(node, key);
      } else if (isNodeType<Rule>(node, RULE_TYPE)) {
        if (node.selector === ':root' || node.selector === ':golbal') {
          node.nodes.forEach(nd => {
            pushVar(nd, key);
          });
        }
      }
    }
  }


  function pushVar(node: Node, path: string) {
    let vars: Vars[] = [];
    let prop: string = '';
    let params: string = '';
    let value: string = '';
    let row: number = 0;
    let column: number = 0;
    if (isNodeType<AtRule>(node, LESS_TYPE)) {
      const name = node.name.split(':');
      vars = lessVars;
      prop = '@' + name[0];
      value = name[1] || '';
      params = node.params;
      row = node.source?.end?.line!;
      column = node.source?.end?.column!;
    } else if (isNodeType<Declaration>(node, DECL_TYPE)) {
      if (node.prop.startsWith('--')) {
        vars = cssVars;
      } else if (node.prop.startsWith('$')) {
        vars = scssVars;
      }
      prop = node.prop;
      value = node.value;
      row = node.source?.end?.line!;
      column = node.source?.end?.column!;
    }
    vars.push({
      prop,
      value,
      params,
      row,
      column,
      filePath: path,
    });
  }
  return {
    cssVars,
    lessVars,
    scssVars
  };
}

