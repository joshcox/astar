export interface IGoal {
  size: number;
  satisfiedBy(node: INode<IData>): boolean;
}

export interface IData {
  id: string;
}

export interface ScoreOptions {
  defaultCost: number;
  discounts: Record<string, number>;
  penalties: Record<string, number>;
}

export interface IScore {
  options: ScoreOptions;
  cost(): number;
  heuristic(): number;
}

export type NodeScoreFactory<Goal extends IGoal, Node extends INode<any>> =
  (goal: Goal) => (node: Node) => IScore;

export type NodeScoreFactory2<Goal extends IGoal, N extends INode<any>> =
  ReturnType<NodeScoreFactory<Goal, N>>;

export interface INode<Data extends IData> {
  isRoot: boolean;
  depth: number;
  data: Data;
  id(): string;
  compareF(other: INode<Data>): number;
  reconstruct(): Data[];
  succeed(data: Data): INode<Data>;
}

export interface INodeSuccessors<Data extends IData> {
  [Symbol.iterator](): Iterable<INode<Data>>;
}
