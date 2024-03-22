import TinyQueue from "tinyqueue";
import { IData, IGoal, INode, INodeSuccessors } from "types";

const isDefined = <T>(value: T | undefined | null): value is T =>
  value !== undefined && value !== null;

function assertsIsDefined<T>(value: T | undefined | null): asserts value is T {
  if (!isDefined(value)) {
    throw new Error('Value is unexpectedly undefined');
  }
}

export class AStar<Data extends IData> {
  constructor(
    public root: INode<Data>,
    public successors: INodeSuccessors<Data>
  ) { }

  public search(goal: IGoal): Data[] | null {
    // The open list is a priority queue of nodes to be evaluated
    const open = new TinyQueue<INode<Data>>([this.root], (a, b) => a.compareF(b));
    // The open set is a set of serialized values of nodes that have been queued
    // We maintain this for quick duplicate checking during successor generation
    const openSet = new Set<string>([this.root.id()]);
    // The closed list is a set of nodes that have already been evaluated
    const closed = new Set<string>();

    while (open.length > 0) {
      const node = open.pop();
      assertsIsDefined(node);
      // Remove the node from the open set; it will be removed from the open queue shortly
      openSet.delete(node.id());
      // If the node has already been evaluated, skip it
      if (closed.has(node.id())) {
        continue;
      }
      // If the node satisfies the goal, yield the path
      if (goal.satisfiedBy(node)) {
        return node.reconstruct();
      }
      // Add unsatisfying node to the closed list
      closed.add(node.id());
      for (const successor of this.successors[Symbol.iterator]()) {
        // If the successor is already queued, skip it
        if (openSet.has(successor.id())) {
          continue;
        }
        open.push(successor);
        openSet.add(successor.id());
      }
    }

    return null;
  }
}
