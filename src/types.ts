export interface IGoal {
  satisfiedBy(node: INode): boolean;
}

export interface IData {
  id: string;
}

export interface IScore {
  cost(): number;
  heuristic(): number;
}

export type IScoreConstructor = new (node: IData, goal: IGoal, options: any) => IScore;

export interface IScoreFactory {
  createScore(goal: IGoal, data: IData): IScore;
}

export type IScoreFactoryConstructor =
  new (options: any) => IScoreFactory;

export interface INode {
  depth: number;
  data: IData;
  parent: INode;
  g(): number;
  h(): number;
  f(): number;
  id(): string;
  compareF(other: INode): number;
  reconstruct(): IData[];
  addChild(node: INode): INode;
}

export type INodeConstructor =
  new (parent: INode, data: IData, score: IScore) => INode;

export interface INodeFactory {
  scoreFactory: IScoreFactory;
  createRoot(): INode;
  createChild(parent: INode, goal: IGoal, data: IData): INode;
}

export type INodeFactoryConstructor =
  new (scoreFactory: IScoreFactory) => INodeFactory;


export interface ISuccessors<Node extends INode> {
  (node: Node): Iterable<Node>;
}
