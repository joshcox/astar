import { INode } from "types";

export class NodeSet<Node extends INode> {
  protected ids = new Set<string>();

  public get length() {
    return this.ids.size;
  }

  public has(node: Node) {
    return this.ids.has(node.id());
  }

  public push(node: Node): NodeSet<Node> {
    this.ids.add(node.id());
    return this;
  }
}
