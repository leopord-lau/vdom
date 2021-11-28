import { generateMap } from "../utils/index";
import { keyMap, parseStartTagReult, tagType } from "../utils/types";

let startTagStartReg = /^<([a-zA-Z0-9]*)/;
let startTagEndReg = /^\s*(\/?)>/;
let endTagReg = /^<\/([a-zA-Z0-9]*)[^>]*>/;
let tagAttributeReg = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
let commentReg = /^<!\--/;
let conditionalComment = /^<!\[/;
let doctypeReg = /^<!DOCTYPE [^>]+>/i;
let htmlReg = /^<html [^>]+>/i;
let IS_REGEX_CAPTURING_BROKEN = false;
'x'.replace(/x(.)?/g, function (m, g) {
    IS_REGEX_CAPTURING_BROKEN = g === '';
    return g;
});
let isIgnoreNewlineTag = generateMap('pre,textarea', true);
let shouldIgnoreFirstNewline = function (tagName: string, html: string) { return tagName && isIgnoreNewlineTag(tagName) && html[0] === '\n'; };
// 解析HTML
export function parseHTML(template: string, options: keyMap) {
    let needle: number = 0;
    let tagStack: Array<any> = [];
    let lastTag: string = "";
    // read html
    while (template) {
      template = template.trim();
            let startIndex = template.indexOf('<');
            // 开始读取
            if (startIndex === 0) {
                // 注释 不解析
                if (commentReg.test(template)) {
                    let commentTagEnd = template.indexOf('-->');
                    if (commentTagEnd >= 0) {
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

                // end tag
                let endTagMatchResult = template.match(endTagReg);
                if (endTagMatchResult) {
                    let currentIndex = needle;
                    tailor(endTagMatchResult[0].length);
                    parseEndTag(endTagMatchResult[1], currentIndex, needle);
                    continue;
                }
                // start tag
                let startTagMatchResult = parseStartTag();
                if (startTagMatchResult) {
                    processStartTag(startTagMatchResult);
                    if (shouldIgnoreFirstNewline(lastTag, template)) {
                        tailor(1);
                    }
                    continue;
                }
            }
            let restTemplate: string, nextTag: number, content: string;
            if (startIndex >= 0) {
                restTemplate = template.slice(startIndex);
                // 文本中的<
                while (!endTagReg.test(restTemplate) &&
                    !startTagStartReg.test(restTemplate) &&
                    !commentReg.test(restTemplate) &&
                    !conditionalComment.test(restTemplate)) {
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
                options.text(content, startIndex, startIndex + content.length)
            }
            if (startIndex < 0) {
                console.warn('you must select at least one node')
                template = `<p>${template}</p>`;
                continue;
            }
    }

    // 解析开始的标签
    function parseStartTag() {
        let tag = template.match(startTagStartReg);
        if (tag) {
            let piece: parseStartTagReult = {
                tagName: tag[1],
                attributes: [],
                startIndex: needle,
                endIndex: -1,
                content: ""
            };
            tailor(tag[0].length);
            let endTag, attribute;
            // 读取标签中的属性
            while (!(endTag = template.match(startTagEndReg)) && (attribute = template.match(tagAttributeReg))) {
                tailor(attribute[0].length);
                piece.attributes.push(attribute);
            }
            if (endTag) {
                piece.unarySlash = endTag[1];
                tailor(endTag[0].length);
                piece.endIndex = needle;
                return piece;
            }
        }
    }
    
    // 处理开始标签
    function processStartTag(startTag: parseStartTagReult) {
        let tagName = startTag.tagName;
        let unarySlash = startTag.unarySlash;
        let attrLength = startTag.attributes.length;
        let attrArr = new Array(attrLength);
        let i = 0;
        for (; i < attrLength; i++) {
            let match = startTag.attributes[i];
            if (IS_REGEX_CAPTURING_BROKEN && match[0].indexOf('""') === -1) {
                if (match[3] === '') {
                    delete match[3];
                }
                if (match[4] === '') {
                    delete match[4];
                }
                if (match[5] === '') {
                    delete match[5];
                }
            }
            let value = match[3] || match[4] || match[5] || '';
            attrArr[i] = {
                name: match[1],
                value: value
            };
        }

        if(options.process) {
            options.process(tagName, attrArr, unarySlash, startTag.startIndex, startTag.endIndex );
        }
        if (tagName !== 'meta') {
            if (!unarySlash) {
                let tag: tagType = { tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrArr }
                tagStack.push(tag);
                lastTag = tagName;
            }
        } else {
            options.end(tagName, startTag.startIndex, startTag.endIndex)
        }
    }
    // 解析结束标签
    function parseEndTag(tagName?: string, startIndex?: number, endIndex?: number) {
        let lowerCasedTagName = "";
        let position;
        if (startIndex === null) {
            startIndex = needle;
        }
        if (endIndex === null) {
            endIndex = needle;
        }
        if (tagName) {
            lowerCasedTagName = tagName.toLowerCase();
        }
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
                if(options.end) {
                    options.end(tagStack[i].tag, startIndex, endIndex)
                }
            }
            tagStack.length = position;

            lastTag = position > 0 ? tagStack[position - 1].tag : ""
        }
         else if(lowerCasedTagName === 'br') {
            if(options.process) {
                options.process(tagName, [], true, startIndex, endIndex)
            }
        }
    }
    // 裁剪标签内容
    function tailor(n: number) {
        needle += n;
        template = template.substring(n);
    }
}
