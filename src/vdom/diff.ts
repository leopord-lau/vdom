import { Vlement } from "./vlement";
import { moveMap, diffMap, domPatch, keyMap } from "../utils/types";


// 新旧节点差异比较（文本、属性、子节点）
function diff(oldNode: Vlement, newNode: Vlement): keyMap {
  let index: number = 0;
  // 用于存储差异节点
  let difference: keyMap = {};
  // 深度遍历
  dsfWalk(oldNode, newNode, index, difference);
  return difference;
}

// 深度遍历  
function dsfWalk(oldNode: Vlement | string, newNode: Vlement | string | null, index: number, difference: keyMap): void {
  // 用于暂时存储差异节点(标记差异类型(文本内容差异，属性差异，节点顺序差异))
  const diffList: Array<moveMap> = [];
  if((typeof oldNode === "string") && (typeof newNode === "string")) {
    // 替换文本
    if(newNode !== oldNode) {
      diffList.push({ type: domPatch.TEXT, content: newNode });
    }
  
  } else if(newNode !== null && (<Vlement>oldNode).tagName === (<Vlement>newNode).tagName && (<Vlement>oldNode).key === (<Vlement>newNode).key) {
    // 节点相同，比较标签内的属性
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
  } else if(newNode !== null) {
    diffList.push({type: domPatch.REPLACE, node: <Vlement>newNode});
  }

  // 记录当前节点的所有差异
  if(diffList.length) {
    difference[index] = diffList;
  }
}

// 比较子节点
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

// 新旧节点子节点对比
function getDiffList(oldChildList: Array<Vlement | string>, newChildList: Array<Vlement | string | null>, key: string): diffMap {
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
  // 移除新节点中不存在但是旧节点中存在的子节点
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

type KeyIndexAndFree = Object & {
  keyIndex: keyMap,
  free: Array<Vlement | string>
}

// 返回带有一个有key标识的节点索引跟无key标识的节点数组对象
function markKeyIndexAndFree(list: Array<Vlement | string | null > | string, key: string): KeyIndexAndFree {
  // 保存带key的节点的索引
  let keyIndex: keyMap = {};
  // 保存不带key的节点数组
  let free: Array<Vlement| string> = [];

  for(let i: number = 0, len: number = list.length; i < len; i++) {
    let item: Vlement | string | null = list[i];
    let itemKey: string | undefined = getItemKey(item, key);
    if(itemKey) {
      keyIndex[itemKey] = i;
    } else {
      free.push(item!);
    }
  }
  return {
    keyIndex: keyIndex,
    free: free
  }
}

// 获取虚拟节点中的key
function getItemKey(item: Vlement | string | null, key: string | Function): string | undefined {
  if(!item || !key) return void 0;
  return typeof key === "string"
    ? (<any>item)[key]
    : key(item)
}

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
  for(key in oldProps) {
    if(newProps[key] !== oldProps[key]) {
      count++;
      diffProps[key] = newProps[key];
    }
  }

  // 新增属性
  for(key in newProps) {
    if(!oldProps.hasOwnProperty(key)) {
      count++;
      diffProps[key] = newProps[key];
    }
  }

  if(count === 0) {
    return null;
  }
  return diffProps;
}


function isIgnoreChildren(node: Vlement): boolean {
  return (node.props && node.props.hasOwnProperty("ignore"));
}


export default diff;