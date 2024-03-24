import { NodeSet } from "node.set";
import { NodeFactory } from "node.factory";
import { IData, IGoal } from "types";
import { NodeQueue } from "node.queue";
import { Node } from "node";

export class AStar<Data extends IData>{
  constructor(private nodeFactory: NodeFactory<Data>) { }

  public searchFromRoot(goal: IGoal): Data[] | null {
    return this.search(this.nodeFactory.createRoot(), goal);
  }

  public search(root: Node<Data>, goal: IGoal): Data[] | null {
    const open = new NodeQueue<Node<Data>>().push(root);
    const closed = new NodeSet<Node<Data>>();

    while (open.length > 0) {
      const node = open.pop();
      // If the node has already been evaluated, skip it
      if (closed.has(node)) {
        continue;
      }
      // If the node satisfies the goal, return the whole path
      if (goal.satisfiedBy(node)) {
        return <Data[]>node.reconstruct();
      }
      // Add unsatisfying node to the closed list
      closed.push(node);
      for (const successor of this.nodeFactory.successors(goal, node)) {
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
