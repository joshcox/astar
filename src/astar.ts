import { NodeSet } from "node.set";
import { NodeFactory } from "node.factory";
import { IData, IGoal, INode } from "types";
import { NodeQueue } from "NodeQueue";

export class AStar {
  constructor(
    private nodeFactory: NodeFactory,
  ) { }

  public searchFromRoot<Data extends IData>(goal: IGoal): Data[] | null {
    return this.search<Data>(this.nodeFactory.createRoot(), goal);
  }

  public search<Data extends IData>(root: INode, goal: IGoal): Data[] | null {
    const open = new NodeQueue<INode>().push(root);
    const closed = new NodeSet<INode>();

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
