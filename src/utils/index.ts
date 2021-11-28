import { ASTAttr, keyMap } from "./types";

export function generateMap(str: string, lowerCase: boolean = true): {(key: string) : true | void } {
  const map = Object.create(null);
  const list: Array<string> = str.split(',');
  for(let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }

  return lowerCase ? (val: string) => map[val.toLocaleLowerCase()] : (val: string) => map[val];
}

export function generateAttrsMap(attrs: Array<ASTAttr>): keyMap {
  const map: keyMap = {};
  for(let i: number = 0; i < attrs.length; i++) {
    map[attrs[i].name] = attrs[i].value;
  }
  return map;
}

export const isHTMLTag = generateMap(
  'html,body,base,head,link,meta,style,title,address,article,' +
  'aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template,blockquote,iframe,tfoot'
)