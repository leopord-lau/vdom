import { Vlement } from "../vdom/vlement";

export interface keyMap {
  [key: string]: any
}

export type moveMap = {
  // 用于删除及添加节点
  index?: number,
  // 差异类型
  type: number,
  item?: Vlement | string,
  moves?: Array<moveMap>
  // 文本差异
  content?: string,
  // 属性差异
  props?: object,
  // 节点替换
  node?: Vlement
}

export type diffMap = Object & {
  moveList: Array<moveMap>,
  children: Array<Vlement | string | null>
}

export type domPatchType = {
  REPLACE: number,
  REORDER: number,
  PROPS: number,
  TEXT: number,
  REMOVE: number,
  ADD: number
}

export let domPatch: domPatchType = {
  REPLACE: 0,
  REORDER: 1,
  PROPS: 2,
  TEXT: 3,
  REMOVE: 4,
  ADD: 5
}

export type vlementOptions = {
  tagName: string;
  props: keyMap;
  // 节点开始位置
  start?: number;
  // 节点结束位置
  end?: number;
  // 用于标记节点
  key?: string;
  parent: Vlement | null;
}


export type ASTAttr = {
  name: string;
  value: string;
  start?: number;
  end?: number;
}

export type parseStartTagReult = {
  tagName: string,
  attributes: Array<RegExpMatchArray>,
  startIndex: number,
  endIndex: number,
  unarySlash?: string,
  content: string
}

export type regMap = {
  [key: string]: RegExp
};

export type tagAttrubte = {
  name: string,
  value: string
}

export type tagType = {
  tag: string,
  lowerCasedTag: string,
  attrs: Array<tagAttrubte | null>,
  content?: string
}