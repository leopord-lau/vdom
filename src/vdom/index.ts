import diff from "./diff";
import patch from "./patch";
import { keyMap, vlementOptions } from "../utils/types";
import { Vlement } from "./vlement";

export default class VirtualDom {
  _diff: (oldNode: Vlement, newNode: Vlement) => object;
  _patch: (node: Node, patches: keyMap) => void;
  $createElement: (options: vlementOptions) => Vlement;
}

VirtualDom.prototype.$createElement = (options: vlementOptions): Vlement => {
  return new Vlement(options);
}

VirtualDom.prototype._diff = diff;

VirtualDom.prototype._patch = patch;
