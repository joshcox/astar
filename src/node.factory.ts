import { IData, IGoal, INodeFactory, IScoreFactory } from "types";
import { Root, Node } from "node";

export class NodeFactory<Data extends IData> implements INodeFactory {
  constructor(
    public scoreFactory: IScoreFactory,
    private successorDataFactory: (node: Node<Data>) => Data[]
  ) { }

  public createRoot(): Node<Data> {
    return new Root();
  }

  public createChild(parent: Node<Data>, goal: IGoal, data: Data): Node<Data> {
    const child = new Node(parent, data, this.scoreFactory.createScore(goal, data));
    parent.addChild(child);
    return child;
  }

  public successors(goal: IGoal, node: Node<Data>): Node<Data>[] {
    return this.successorDataFactory(node).map(data => node.addChild(this.createChild(node, goal, data)));
  }
}
