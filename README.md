# vdom

Html parser and virtual dom inspired by vue2.

here's a blog in chinese;

# 虚拟 DOM

## 真实 DOM 渲染流程

浏览器渲染引擎工作流程都差不多，大致分为 5 步，创建`DOM`树--创建`StyleRules`--创建`Render`树--布局`Layout`--绘制`Painting`。

1. 用`HTML`分析器，分析`HTML`元素，构建一颗`DOM`树(标记化和树构建)
2. 用`CSS`分析器，分析`CSS`文件和元素上的`inline`样式，生成页面的样式表
3. 将`DOM`树和样式表，关联起来，构建一颗`Render`树(这一过程又称为`Attachment`)。每个`DOM`节点都有`attach`方法，接受样式信息，返回一个`render`对象(又名`renderer`)。这些`render`对象最终会被构建成一颗`Render`树。
4. 有了`Render`树，浏览器开始布局，为每个`Render`树上的节点确定一个在显示屏上出现的精确坐标。
5. `Render`树和节点显示坐标都有了，就调用每个节点`paint`方法，把它们绘制出来。

在使用原生`js`或`JQ`操作`DOM`时，浏览器会从构建`DOM`树开始从头到尾执行一遍流程。当我们需要操作 10 个`DOM`节点时，浏览器会执行 10 次流程，例如，第一次计算完，紧接着下一个 DOM 更新请求，这个节点的坐标值就变了，前一次计算为无用功。计算 DOM 节点坐标值等都是白白浪费的性能。即使计算机硬件一直在迭代更新，操作 DOM 的代价仍旧是昂贵的，频繁操作还是会出现页面卡顿，影响用户体验。

> 回流和重绘
>
> - 回流 `reflow`:当渲染树`renderTree`中的一部分或全部因为尺寸、布局、隐藏等改变改重新构建，称之为回流。
> - 重绘 `repaint`：当渲染树`renderTree`中的一部分元素需要更新属性，而属性只会影响外观、风格而不影响布局，比如颜色、字体大小等，则称之为重绘。
>
> 用`jquery`时基本都是在操作`dom`。会频繁引起呈现树的重绘和回流，pc 端处理能力还不错，但移动端性能就会很差。导致页面卡顿。

## 虚拟 DOM 概念

`virtual DOM` 虚拟`DOM`，用普通`js`对象来描述`DOM`结构，因为不是真实`DOM`，所以称之为虚拟`DOM`。

虚拟`DOM`就是为了解决浏览器性能问题而被设计出来的。如前，若一次操作中有 10 次更新`DOM`的动作，虚拟`DOM`不会立即操作`DOM`，而是将这 10 次更新的`diff`内容保存到本地一个`js`对象中，最终将这个`js`对象一次性`attch`到`DOM`树上，再进行后续操作，避免大量无谓的计算量。所以，用`js`对象模拟`DOM`节点的好处是，页面的更新可以先全部反映在`js`对象(虚拟`DOM`)上，操作内存中的`js`对象的速度显然要更快，等更新完成后，再将最终的`js`对象映射成真实的`DOM`，交由浏览器去绘制。

## 实现一个虚拟 DOM

### 1. 解析`html`标签

将`html`中的标签进行解析，转换成对象格式。

通过`document.getElementsByTagName`或者其他方法获取到节点的`string`格式作为`template`进行解析。

新建一个指针用来标识当前解析的位置，通过循环不断读取`template`。我们知道标签是由`<tagName>`尖括号标识的，那么我们可以通过查找`<`字符是否存在及位置来解析`template`。

当`<`处在第一个位置时，说明正在解析一个标签。而当`<`处于其他位置并不在第一个位置，说明`<`字符前面的字符都是处于上一个父标签中的内容。当没有找到`<`字符，那么说明传入的`template`其实是一个文本，这时我们对它的处理是把它包裹在一个`p`标签中进行解析（当然也可以做其他处理）。

```js
let needle: number = 0;

while (template) {
  template = template.trim();
  let startIndex = template.indexOf('<');
  // 解析标签
  if (startIndex === 0) {
    // ...
  }
  // 解析父标签的内容
  if (startIndex >= 0) {
    // ...
  }
  // 纯文本
  if (startIndex < 0) {
    console.warn('you must select at least one node');
    template = `<p>${template}</p>`;
    continue;
  }
}
```

在解析标签时，首先需要过滤出注释 `<!-- \** -->`及`docType`、`html`等标签。

```js
let startTagStartReg = /^<([a-zA-Z0-9]*)/;
let startTagEndReg = /^\s*(\/?)>/;
let endTagReg = /^<\/([a-zA-Z0-9]*)[^>]*>/;
let tagAttributeReg = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
let commentReg = /^<!\--/;
let conditionalComment = /^<!\[/;
let doctypeReg = /^<!DOCTYPE [^>]+>/i;
let htmlReg = /^<html [^>]+>/i;

if (startIndex === 0) {
  // 注释
  if (commentReg.test(template)) {
      let commentTagEnd = template.indexOf('-->');
      if (commentTagEnd >= 0) {
          // 移动指针
          tailor(commentTagEnd + 3);
          continue;
      }
  }
  // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
  if (conditionalComment.test(template)) {
      let conditionalCommentTagEnd = template.indexOf(']>');
      if (conditionalCommentTagEnd >= 0) {
          tailor(conditionalCommentTagEnd + 2);
          continue;
      }
  }
  // DocType:
  let doctypeMatchResult = template.match(doctypeReg);
  if (doctypeMatchResult) {
      tailor(doctypeMatchResult[0].length);
      continue;
  }

  // htmlType:
  let htmlMatchResult = template.match(htmlReg);
  if (htmlMatchResult) {
      console.warn("root element can't be html, or it would in a infinite loop");
      break;
  }

  // 处理标签
  // ...
}
```

在处理完特殊标签后，我们继续看如何处理普通标签。主要是对开始和结束两个标签进行处理。

```js
  // 结束标签
  let endTagMatchResult = template.match(endTagReg);
  if (endTagMatchResult) {
      let currentIndex = needle;
      tailor(endTagMatchResult[0].length);
      parseEndTag(endTagMatchResult[1], currentIndex, needle);
      continue;
  }
  // 开始标签
  let startTagMatchResult = parseStartTag();
  if (startTagMatchResult) {
      processStartTag(startTagMatchResult);
      if (shouldIgnoreFirstNewline(lastTag, template)) {
          tailor(1);
      }
      continue;
  }
```

先来看处理开始标签部分。在匹配到开始标签后，开始解析这个标签，获取标签名跟标签内的所有属性。

```js
// 解析开始的标签
function parseStartTag() {
  let tag = template.match(startTagStartReg);
  if (tag) {
    let piece: parseStartTagReult = {
      tagName: tag[1],
      attributes: [],
      startIndex: needle,
      endIndex: -1,
      content: '',
    };
    tailor(tag[0].length);
    let endTag, attribute;
    // 读取标签中的属性
    while (
      !(endTag = template.match(startTagEndReg)) &&
      (attribute = template.match(tagAttributeReg))
    ) {
      tailor(attribute[0].length);
      piece.attributes.push(attribute);
    }
    if (endTag) {
      // 看看 > 字符前面有没有 / 字符，有说明是自关闭标签
      piece.unarySlash = endTag[1];
      tailor(endTag[0].length);
      piece.endIndex = needle;
      return piece;
    }
  }
}
```

那么这个方式其实就是返回包含这个标签信息的一个对象。

`processStartTag`

```js
// 处理开始标签
function processStartTag(startTag: parseStartTagReult) {
  let tagName = startTag.tagName;
  let unarySlash = startTag.unarySlash;
  let attrLength = startTag.attributes.length;
  let attrArr = new Array(attrLength);
  let i = 0;
  // 获取属性
  for (; i < attrLength; i++) {
    let match = startTag.attributes[i];
    let value = match[3] || match[4] || match[5] || '';
    attrArr[i] = {
      name: match[1],
      value: value,
    };
  }

  if (options.process) {
    options.process(
      tagName,
      attrArr,
      unarySlash,
      startTag.startIndex,
      startTag.endIndex
    );
  }
  if (tagName !== 'meta') {
    if (!unarySlash) {
      let tag: tagType = {
        tag: tagName,
        lowerCasedTag: tagName.toLowerCase(),
        attrs: attrArr,
      };
      // 将当前标签信息推入栈中，用于后续节点找父节点
      tagStack.push(tag);
      lastTag = tagName;
    }
  } else {
    options.end(tagName, startTag.startIndex, startTag.endIndex);
  }
}
```

`process`用于生成一个节点对象。

```js
process(tagName: string, attrs: ASTAttr[], unartSlash: string, startIndex: number, endIndex: number) {
  let element: Vlement = createASTElement(tagName, attrs, currentParentElement);

  if(!root) {
    root = element;
  }

  // 判断是否是自关闭标签
  if(!unartSlash) {
    currentParentElement = element;
    tagStack.push(element)
  } else {
    closeElement(element);
  }
}

// 创建节点对象
function createASTElement(tagName: string, attrs: Array<ASTAttr>, currentParentElement: Vlement): Vlement {
  return new Vlement({
    tagName: tagName,
    props: generateAttrsMap(attrs),
    parent: currentParentElement,
  })
}
```

对于处理结束标签来说，其实也就是将之前处理开始标签时入栈的节点信息清除，以及后续虚拟节点的一些处理。
`praseEndTag`

```js
// 解析结束标签
function parseEndTag(tagName?: string, startIndex?: number, endIndex?: number) {
  let lowerCasedTagName = '';
  let position;
  // 匹配最近的开始标签，用于关闭该标签
  if (tagName) {
    for (position = tagStack.length - 1; position >= 0; position--) {
      if (tagStack[position].lowerCasedTag === lowerCasedTagName) {
        break;
      }
    }
  } else {
    position = 0;
  }
  if (position >= 0) {
    let i: number = 0;
    let length: number = tagStack.length - 1;
    for (i = length; i >= position; i--) {
      if (options.end) {
        options.end(tagStack[i].tag, startIndex, endIndex);
      }
    }
    tagStack.length = position;

    lastTag = position > 0 ? tagStack[position - 1].tag : '';
  } else if (lowerCasedTagName === 'br') {
    if (options.process) {
      options.process(tagName, [], true, startIndex, endIndex);
    }
  }
}
```

`end`完成当前节点对象的生成。

```js
end (tagName: string, startIndex: number, endIndex: number) {
  const element: Vlement = tagStack[tagStack.length - 1];
  tagStack.length -= 1;
  let lastElement = tagStack[tagStack.length - 1];
  if(lastElement) {
    currentParentElement = lastElement;
  }
  closeElement(element);
}

// 与父节点进行关联
function closeElement(element: Vlement) {
  trimEndingWhitespace(element);
  if(currentParentElement) {
    const length: number = currentParentElement.children.length;
    const lastChild: Vlement | string | null = length > 0 ? currentParentElement.children[length - 1] : null;
    lastChild && (lastChild !== "") && fillWithTextNode(currentParentElement)
    if(currentParentElement.id !== element.id) {
      currentParentElement.addChild(element);
      element.parent = currentParentElement;
    }
  }

  trimEndingWhitespace(element);
}
```

解析父标签内容，取出标签中的文本。

```js
let restTemplate: string, nextTag: number, content: string;
if (startIndex >= 0) {
  restTemplate = template.slice(startIndex);
  // 文本中的<
  while (
    !endTagReg.test(restTemplate) &&
    !startTagStartReg.test(restTemplate) &&
    !commentReg.test(restTemplate) &&
    !conditionalComment.test(restTemplate)
  ) {
    nextTag = restTemplate.indexOf('<', 1);
    if (nextTag < 0) {
      break;
    }
    startIndex += nextTag;
    restTemplate = template.slice(startIndex);
  }
  content = template.substring(0, startIndex);
  tagStack[tagStack.length - 1].content = content;
  tailor(startIndex);
  // 生成文本节点对象
  options.text(content, startIndex, startIndex + content.length);
}
```

`text` 生成文本节点对象并与父节点进行关联

```js
text(content: string, startIndex: number, endIndex: number) {
  if(!currentParentElement) {
    return;
  }

  content = content.trim();
  if(content) {
    currentParentElement.addChild(content);
  }
}
```

到这里为止，从`html`标签解析成为虚拟节点的流程就完成了。

### 2. 虚拟节点

虚拟节点就是使用一个对象描述标签状态。

```js
class Vlement {
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
```

同时提供了一个`_render`方法用于将虚拟节点节点转换成真实`dom`节点。

```js
Vlement.prototype._render = function () {
  let el: Element = document.createElement(this.tagName);
  let props: keyMap = this.props;
  for (let name in props) {
    let value: string = props[name];
    el.setAttribute(name, value);
  }

  let children: Array<Vlement | string> = this.children;
  children.forEach(function (child: Vlement | string) {
    let child_el: Element | Text =
      child instanceof Vlement
        ? child._render()
        : document.createTextNode(_renderToStringEntity(child));
    el.appendChild(child_el);
  });
  return el;
};

// 解析特殊字符
const _renderToStringEntity = function (str: string): string {
  var arrEntities: keyMap = {
    lt: '<',
    gt: '>',
    nbsp: ' ',
    amp: '&',
    quot: '"',
  };
  return str.replace(/&(lt|gt|nbsp|amp|quot);/gi, function (all, t) {
    return arrEntities[t];
  });
};
```

在虚拟节点中我们可以对`dom`进行多次操作，最后进行`patch`后渲染成真实节点从而减少重绘和回流。

采用深度遍历方式遍历新旧节点，使用一个`stack`来记录变化。

主要分为几部分：

1. 文本内容差异： 直接替换掉当前的内容；

```js
if (typeof oldNode === 'string' && typeof newNode === 'string') {
  // 替换文本
  if (newNode !== oldNode) {
    diffList.push({ type: domPatch.TEXT, content: newNode });
  }
}
```

2. 属性差异：当当前标签相同时，比较标签内的属性及其子节点。

```js
let diffProps: object | null = getDiffProps(<Vlement>oldNode, <Vlement>newNode);

if(diffProps) {
  diffList.push({ type: domPatch.PROPS, props: diffProps });
}

// 子节点比较
if(!isIgnoreChildren(<Vlement>newNode)) {
  diffChildren(
    (<Vlement>oldNode).children,
    (<Vlement>newNode).children,
    index,
    difference,
    diffList
  )
}
```

`getDiffProps` 获取新旧节点中不同的属性。

```js
// 获取新节点中新增或与旧节点不同的属性
function getDiffProps(oldNode: Vlement, newNode: Vlement): keyMap | null {
  // 记录不同属性的数量
  let count: number = 0;
  // 旧节点所有属性
  let oldProps: keyMap = oldNode.props;
  // 新节点所有属性
  let newProps: keyMap = newNode.props;
  // 保存新旧节点中不同的属性
  let diffProps: keyMap = {};
  let key: string;

  // 遍历旧节点中的所有属性，判断新旧节点中属性情况
  for (key in oldProps) {
    if (newProps[key] !== oldProps[key]) {
      count++;
      diffProps[key] = newProps[key];
    }
  }

  // 新增属性
  for (key in newProps) {
    if (!oldProps.hasOwnProperty(key)) {
      count++;
      diffProps[key] = newProps[key];
    }
  }

  if (count === 0) {
    return null;
  }
  return diffProps;
}
```

`getDiffChildren` 比较新旧子节点。

```js
function diffChildren(oldChildList: Array<Vlement | string>, newChildList: Array<Vlement| string | null> , index: number, difference: keyMap, diffList: Array<moveMap>): void {
  let diffMap: diffMap = getDiffList(oldChildList, newChildList, "key");
  newChildList = diffMap.children;

  if(diffMap.moveList.length) {
    let reorderPatch: moveMap = { type: domPatch.REORDER, moves: diffMap.moveList };
    diffList.push(reorderPatch);
  }

  let leftNode: Vlement | string;
  let currentNodeIndex: number = index;

  oldChildList.forEach((child, i) => {
    let newChild: Vlement | string | null = newChildList[i];
    currentNodeIndex = (leftNode && (<Vlement>leftNode).child_num) ? currentNodeIndex + (<Vlement>leftNode).child_num + 1 : currentNodeIndex + 1;
    dsfWalk(child, newChild, currentNodeIndex, difference);
    leftNode = child;
  })
}
```

`getDiffList` 新旧节点子节点对比。使用`key`来标识节点，可以加快`diff`。

```js
function getDiffList(oldChildList: Array<Vlement | string>, newChildList: Array<Vlement | string | null>, key: string): diffMap {
  // 获取有一个有key标识的节点索引跟无key标识的节点数组对象
  let oldMap: KeyIndexAndFree = markKeyIndexAndFree(oldChildList, key);
  let newMap: KeyIndexAndFree = markKeyIndexAndFree(newChildList, key);

  // 获取带有key值的节点索引
  let oldKeyIndex: keyMap = oldMap.keyIndex;
  let newKeyIndex: keyMap = newMap.keyIndex;

  let i: number = 0;
  let item: Vlement | string | null;
  let itemKey: string | undefined;
  // 新旧节点差异patch数组
  let children: Array<Vlement | string | null> = [];

  // 无key值节点游标
  let freeIndex: number = 0;
  // 获取新节点中不带key值的所有节点
  let newFree: Array<Vlement | string> = newMap.free;
  let moveList:Array<moveMap> = [];

  // 循环遍历旧节点
  while(i < oldChildList.length) {
    item = oldChildList[i];
    itemKey = getItemKey(item, key);
    // 旧节点中存在key值
    if(itemKey) {
      // 新节点中不存在这个key，说明被删除了
      if(!newKeyIndex.hasOwnProperty(itemKey)) {
        // null 代表删除
        children.push(null);
      // 新节点中存在key
      } else {
        // 新节点中存在带有这个key的节点，获取这个节点的索引
        let newItemIndex: number = newKeyIndex[itemKey];
        children.push(newChildList[newItemIndex]);
      }
    // 旧节点不存在key，根据旧节点的个数将新节点逐个添加到数组中，当新节点个数比旧节点多时就会有节点添加到数组中
    } else {
      let freeItem: Vlement | string = newFree[freeIndex++];
      if(freeItem) {
        children.push(freeItem);
      } else {
        children.push(null);
      }
    }
    i++;
  }

  let copyList: Array<Vlement | string | null> = children.slice(0);
  // 重置
  i = 0;
  // 获取旧节点需要移除的节点数组
  while(i < copyList.length) {
    if(copyList[i] === null) {
      _remove(i);
      _removeCopy(i);
    } else {
      i++;
    }
  }

  // 游标，一个用于新节点的子节点，另一个用于旧节点跟新节点对比后获取的节点列表
  let j: number = i = 0;

  while(i < newChildList.length) {
    item = newChildList[i];
    itemKey = getItemKey(item, key);

    let copyItem: Vlement | string | null = copyList[j];
    let copyItemKey: string | undefined = getItemKey(copyItem!, key);

    if(copyItem) {
      if(itemKey === copyItemKey) {
        j++;
      } else {
        // 旧节点中不存在，就直接插入(不存在对应的key，也直接添加)
        if(!oldKeyIndex.hasOwnProperty(itemKey!)) {
          _insert(i, item!);
        } else {
          let nextItemKey: string | undefined = getItemKey(copyItemKey![j + 1], key);
          if(nextItemKey === itemKey) {
            _remove(i);
            _removeCopy(j);
            j++;
          } else {
            _insert(i, item!);
          }
        }
      }
    } else {
      _insert(i, item!);
    }
    i++;
  }

  let left: number = copyList.length - j;
  while(j++ < copyList.length) {
    left--;
    _remove(left + i);
  }


  function _remove(index: number): void {
    moveList.push({index: index, type: domPatch.REMOVE});
  }
  function _removeCopy(index: number): void {
    copyList.splice(index, 1);
  }
  function _insert(index: number, item: Vlement | string): void {
    moveList.push({index: index, item: item, type: domPatch.ADD});
  }

  return {
    moveList: moveList,
    children: children
  }
}
```

3. 新增节点，直接添加该节点

```js
if(newNode !== null) {
  diffList.push({type: domPatch.REPLACE, node: <Vlement>newNode});
}
```

获取了新旧节点的差异（替换、重排、属性差异、文本差异）后进行`patch`操作。
`patch`方法的第一个参数是真实根节点，`patches`则是新旧节点对比后得出的差异。同样采用深度遍历的方式。

```js
function patch(node: Node, patches: keyMap): void {
  let walker: walkerType = { index: domPatch.REPLACE };
  dsfWalk(node, walker, patches);
}

// 深度遍历
function dsfWalk(node: Node, walker: walkerType, patches: keyMap): void {
  // 获取patch数组
  const currentPatches: Array<moveMap> = patches[walker.index];
  const len: number = node.childNodes ? node.childNodes.length : 0;

  for (let i: number = 0; i < len; i++) {
    let child: Node = node.childNodes[i];
    walker.index++;
    dsfWalk(child, walker, patches);
  }

  if (currentPatches) {
    startPatches(node, currentPatches);
  }
}
```

根据不同的差异类型进行不同的操作。

```js
function startPatches(node: Node, currentPatches: Array<moveMap>): void {
  currentPatches.forEach(currentPatch => {
    switch (currentPatch.type) {
      case domPatch.REPLACE:
        const newNode = (typeof currentPatch.node === 'string') ? document.createTextNode(currentPatch.node) : currentPatch.node!._render();
        node.parentNode!.replaceChild(newNode, node);
        break;
      case domPatch.REORDER:
        reorderChildren(node, currentPatch.moves!);
        break;
      case domPatch.PROPS:
        setProps(node, currentPatch.props!);
        break;
      case domPatch.TEXT:
        node.textContent = currentPatch.content!
        break
      default:
        throw new Error('Unknown patch type ' + currentPatch.type)
    }
  })
}
```

`reorderChildren` 重新排序

```js
// 重新排列
function reorderChildren(node: Node, moveList: Array<moveMap>): void {
  let staticNodeList: Array<any> = Array.prototype.slice.call(node.childNodes);
  let keyMap: keyMap = {};

  staticNodeList.forEach(node => {
    // 元素节点
    if(node.nodeType === 1) {
      const key: string | null = (<Element>node).getAttribute('key');
      if(key) {
        keyMap[key] = node;
      }
    }
  })

  moveList.forEach(move => {
    const i: number | undefined = move.index;
    if(!i) return;
    // 移除节点
    if(move.type === domPatch.REMOVE) {
      if(staticNodeList[i] === node.childNodes[i]) {
        node.removeChild(node.childNodes[i]);
      }
      staticNodeList.splice(i, 1);
    } else if(move.type === domPatch.ADD) {
      const newNode: Node = keyMap[(<Vlement>move.item).key]
        ? keyMap[(<Vlement>move.item).key].cloneNode(true)
        : typeof (<string>move.item) === 'string'
          ? document.createTextNode(<string>move.item)
          : (<Vlement>move.item)._render();

      staticNodeList.splice(i, 0, newNode);
      node.insertBefore(newNode, node.childNodes[i] || null);
    }
  })
}
```

至此，相关原理已经讲解完了，查看源代码:[https://github.com/leopord-lau/vdom](https://github.com/leopord-lau/vdom)
