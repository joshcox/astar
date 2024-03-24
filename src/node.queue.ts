import { NodeSet } from "node.set";
import { assertsIsDefined } from "assertsIsDefined";
import TinyQueue from "tinyqueue";
import { INode } from "types";

export class NodeQueue<Node extends INode> extends NodeSet<Node> {
  private queue = new TinyQueue<Node>([], (a, b) => a.compareF(b));

  public get length() {
    return this.queue.length;
  }

  public push(node: Node): NodeQueue<Node> {
    this.queue.push(node);
    this.ids.add(node.id());
    return this;
  }

  public pop(): Node | undefined {
    const node = this.queue.pop();
    assertsIsDefined(node);
    this.ids.delete(node.id());
    return node;
  }
}
