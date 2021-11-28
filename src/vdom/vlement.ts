import { keyMap, vlementOptions } from "../utils/types";
let id: number = 0;
// 创建一个元素对象，用来代表虚拟节点

export class Vlement {
  id: number;
  tagName: string;
  props: keyMap;
  // 节点开始位置
  start?: number;
  // 节点结束位置
  end?: number;
  // 用于标记节点
  key: string;
  child_num: number;
  children: Array<Vlement | string>;
  parent: Vlement | null;
  _render: () => Element;
  _diff: (oldNode: Vlement, newNode: Vlement) => object;

  constructor(options: vlementOptions) {
    this.id = id++;
    this.tagName = options.tagName;
    this.props = options.props;
    this.start = options.start;
    this.end = options.end;
    if(this.props.key) {
      this.key = options.props.key;
    }
    this.parent = options.parent;
    this.child_num = 0;
    this.children = []
  }

  addChild(child: Vlement | string) {
    this.children.push(child);
    this.child_num++;
  }
}

Vlement.prototype._render = function () {
  let el: Element = document.createElement(this.tagName);
  let props: keyMap = this.props;
  for(let name in props) {
    let value: string = props[name];
    el.setAttribute(name, value);
  }

  let children: Array<Vlement | string> = this.children;
  children.forEach(function(child: Vlement | string) {
    let child_el: Element | Text = (child instanceof Vlement) ? child._render() : document.createTextNode(_renderToStringEntity(child));
    el.appendChild(child_el);
  })
  return el;
}

// 解析特殊字符
const _renderToStringEntity = function(str: string): string {
  var arrEntities: keyMap ={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'};
  return str.replace(/&(lt|gt|nbsp|amp|quot);/ig,function(all,t){return arrEntities[t];});
}