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
  createScore(data: IData): IScore;
}

export type IScoreFactoryConstructor =
  new (goal: IGoal, options: any) => IScoreFactory;

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
  createNode(parent: INode, data: IData): INode;
}

export type INodeFactoryConstructor =
  new (scoreFactory: IScoreFactory) => INodeFactory;


export interface ISuccessors<Node extends INode> {
  (node: Node): Iterable<Node>;
}

export interface IAStar {
  search(root: INode, goal: IGoal): IData[] | null;
}
