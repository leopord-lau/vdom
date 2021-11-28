import { generateAttrsMap } from "../utils/index";
import { ASTAttr } from "../utils/types";
import { Vlement } from "../vdom/vlement";
import { parseHTML } from "./parse";

export function parse(template: string): Vlement {
  let currentParentElement: Vlement;
  const invalidAttributeRE: RegExp = /[\s"'<>\/=]/;
  let root: Vlement;;
  let tagStack: Array<Vlement> = [];

  parseHTML(template, {
    // 文本标签
    text(content: string) {
      if(!currentParentElement) {
        if(content === template) {
          console.warn(`没有根节点，只有文本`);
        }
        return;
      }

      content = content.trim();
      if(content) {
        currentParentElement.addChild(content);
      }
    },

    process(tagName: string, attrs: ASTAttr[], unartSlash: string, startIndex: number, endIndex: number) {
      let element: Vlement = createASTElement(tagName, attrs, currentParentElement);
      element.start = startIndex;
      element.end = endIndex;

      attrs.forEach(attr => {
        if (invalidAttributeRE.test(attr.name)) {
          console.warn(
            `Invalid expression: attribute names cannot contain ` +
            `spaces, quotes, <, >, / or =.`,
            {
              start: attr.start! + attr.name.indexOf(`[`),
              end: attr.start! + attr.name.length
            }
          )
        }
      })

      if(!root) {
        root = element;
      }

      if(!unartSlash) {
        currentParentElement = element;
        tagStack.push(element)
      } else {
        closeElement(element);
      }
    },
    end (endIndex: number) {
      const element: Vlement = tagStack[tagStack.length - 1];
      tagStack.length -= 1;
      let lastElement = tagStack[tagStack.length - 1];
      if(lastElement) {
        currentParentElement = lastElement;
      }
      element.end = endIndex;
      closeElement(element);
    }
  })

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

  function trimEndingWhitespace(el: Vlement) {
    let lastElement: Vlement | string;
    while((lastElement = el.children[el.children.length - 1]) && lastElement === ' ' ) {
      el.children.pop();
    }
  }

  return root!;
}

function fillWithTextNode(parent: Vlement) {
  parent.addChild('')
}

function createASTElement(tagName: string, attrs: Array<ASTAttr>, currentParentElement: Vlement): Vlement {
  return new Vlement({
    tagName: tagName,
    props: generateAttrsMap(attrs),
    parent: currentParentElement,
  })
}
