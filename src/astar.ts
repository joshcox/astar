import TinyQueue from "tinyqueue";
import { IAStar, IData, IGoal, INode, ISuccessors } from "types";

const isDefined = <T>(value: T | undefined | null): value is T =>
  value !== undefined && value !== null;

function assertsIsDefined<T>(value: T | undefined | null): asserts value is T {
  if (!isDefined(value)) {
    throw new Error('Value is unexpectedly undefined');
  }
}

class NodeSet<Node extends INode<IData>> {
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

class OpenSet<Node extends INode<IData>> extends NodeSet<Node> {
  private queue = new TinyQueue<Node>([], (a, b) => a.compareF(b));

  public get length() {
    return this.queue.length;
  }

  public push(node: Node): OpenSet<Node> {
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

export class AStar<Data extends IData, Node extends INode<Data>> implements IAStar<Data> {
  constructor(
    public successors: ISuccessors<Node>,
  ) { }

  public search(root: Node, goal: IGoal): Data[] | null {
    const open = new OpenSet<Node>().push(root);
    const closed = new NodeSet<Node>();

    while (open.length > 0) {
      const node = open.pop();
      // If the node has already been evaluated, skip it
      if (closed.has(node)) {
        continue;
      }
      // If the node satisfies the goal, return the whole path
      if (goal.satisfiedBy(node)) {
        return node.reconstruct();
      }
      // Add unsatisfying node to the closed list
      closed.push(node);
      for (const successor of this.successors(node)) {
        // If the successor is already queued, skip it
        if (open.has(successor)) {
          continue;
        }
        open.push(successor);
      }
    }

    return null;
  }
}
