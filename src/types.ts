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

export interface IScoreOptions {
  cost: {
    discounts: Record<string, number>;
    penalties: Record<string, number>;
  },
  heuristic: {
    discounts: Record<string, number>;
    penalties: Record<string, number>;
  }
}

export type IScoreConstructor = new (node: IData, goal: IGoal, options: IScoreOptions) => IScore;

export interface IScoreFactory {
  createScore(goal: IGoal, data: IData): IScore;
}

export interface INode {
  parent: INode;
  data: IData;
  depth: number;
  children: INode[];
  id(): string;
  g(): number;
  h(): number;
  f(): number;
  id(): string;
  compareF(other: INode): number;
  reconstruct(): IData[];
  addChild(node: INode): INode;
}

export interface INodeFactory {
  scoreFactory: IScoreFactory;
  createRoot(): INode;
  createChild(parent: INode, goal: IGoal, data: IData): INode;
  successors(goal: IGoal, node: INode): INode[];
}
