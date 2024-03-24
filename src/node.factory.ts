import { IData, IGoal, INode, INodeFactory, IScoreFactory } from "types";
import { Root, Node } from "node";


export class NodeFactory implements INodeFactory {
  constructor(
    public scoreFactory: IScoreFactory,
    private buildSuccessorData: (node: INode) => IData[]
  ) { }

  public createRoot(): INode {
    return new Root();
  }

  public createChild(parent: INode, goal: IGoal, data: IData): INode {
    const child = new Node(<Node<IData>>parent, data, this.scoreFactory.createScore(goal, data));
    parent.addChild(child);
    return child;
  }

  public successors(goal: IGoal, node: INode): INode[] {
    return this.buildSuccessorData(node).map(data => node.addChild(this.createChild(node, goal, data)));
  }
}
