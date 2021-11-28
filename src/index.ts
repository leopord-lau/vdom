import { parse } from "./compiler/index";
import VirtualDom from "./vdom/index";

const vd = new VirtualDom();

const ul = document.querySelectorAll('ul')[0];
const vul1 = parse(ul.outerHTML);

var el = vd.$createElement;
var diff = vd._diff
var patch = vd._patch
let ul1 = el({
  tagName: 'div',
  props: {},
  parent: null
})
ul1.addChild('this is a div tag');

console.log(ul1);
let ul2 = el({
  tagName: 'div',
  props: {},
  parent: null
})
ul2.addChild('change text');
console.log(ul2)
var patches = diff(ul1,ul2);
console.log('patches:',patches);

patch(document.getElementsByTagName('body')[0], patches);



const script = parse(decodeURI("%3Cbody%3E%0A%20%20%20%20%3Cheader%3E%0A%20%20%20%20%20%20%3Cnav%3E%0A%20%20%20%20%20%20%20%20%3Cul%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cli%3E%3Ca%20href=%22https://www.w3.org/standards/%22%3EStandards%3C/a%3E%3C/li%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cli%3E%3Ca%20href=%22https://www.w3.org/participate/%22%3EParticipate%3C/a%3E%3C/li%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cli%3E%3Ca%20href=%22https://www.w3.org/Consortium/membership%22%3EMembership%3C/a%3E%3C/li%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cli%3E%3Ca%20href=%22https://www.w3.org/Consortium/%22%3EAbout%20W3C%3C/a%3E%3C/li%3E%0A%20%20%20%20%20%20%20%20%3C/ul%3E%0A%20%20%20%20%20%20%3C/nav%3E%0A%20%20%20%20%3C/header%3E%0A%20%20%20%20%3Cmain%3E%0A%20%20%20%20%20%20%3Csection%20id=%22content%22%3E%0A%20%20%20%20%20%20%20%20%3Cp%3E%3Ca%20href=%22https://html.spec.whatwg.org/multipage/%22%3Ehttps://html.spec.whatwg.org/multipage/%3C/a%3E%0A%20%20%20%20%20%20%20%20is%20the%20current%20HTML%20standard.%20It%20obsoletes%20all%20other%0A%20%20%20%20%20%20%20%20previously-published%20HTML%20specifications.%0A%20%20%20%20%20%20%20%20%3C/p%3E%3Cp%3EAs%20announced%20at%0A%20%20%20%20%20%20%20%20%3Ca%20href=%22https://www.w3.org/blog/2019/05/w3c-and-whatwg-to-work-together-to-advance-the-open-web-platform/%22%3Ehttps://www.w3.org/blog/2019/05/w3c-and-whatwg-to-work-together-to-advance-the-open-web-platform/%3C/a%3E,%0A%20%20%20%20%20%20%20%20the%20W3C%20and%20the%20WHATWG%20signed%20an%20agreement%20to%20collaborate%20on%20the%0A%20%20%20%20%20%20%20%20development%20of%20a%20single%20version%20of%20the%20HTML%20and%20DOM%20specifications:%0A%20%20%20%20%20%20%20%20%3C/p%3E%3Cul%3E%0A%20%20%20%20%20%20%20%20%3Cli%3E%0A%20%20%20%20%20%20%20%20%3Ca%20href=%22https://html.spec.whatwg.org/multipage/%22%3Ehttps://html.spec.whatwg.org/multipage/%3C/a%3E%0A%20%20%20%20%20%20%20%20is%20the%20single%20version%20of%20HTML%20being%20actively%20developed%0A%20%20%20%20%20%20%20%20%3C/li%3E%3Cli%3E%3Ca%20href=%22https://dom.spec.whatwg.org/%22%3Ehttps://dom.spec.whatwg.org/%3C/a%3E%0A%20%20%20%20%20%20%20%20is%20the%20single%20version%20of%20the%20DOM%20specification%20being%20actively%0A%20%20%20%20%20%20%20%20developed.%0A%20%20%20%20%20%20%20%20%3C/li%3E%3C/ul%3E%0A%20%20%20%20%20%20%20%20%3Cp%3E%0A%20%20%20%20%20%20%20%20For%20further%20details%20about%20the%20W3C-WHATWG%20agreement,%20see%20the%0A%20%20%20%20%20%20%20%20%3Ca%20href=%22https://www.w3.org/2019/04/WHATWG-W3C-MOU.html%22%3EMemorandum%20of%20Understanding%20Between%20W3C%20and%20WHATWG%3C/a%3E.%0A%20%20%20%20%20%20%3C/p%3E%3C/section%3E%0A%20%20%20%20%3C/main%3E%0A%20%20%0A%0A%3C/body%3E"))
console.log(script);
document.body.appendChild(script._render());