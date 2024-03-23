export interface IGoal {
  satisfiedBy(node: INode<IData>): boolean;
}

export interface IData {
  id: string;
}

export interface IScore {
  cost(): number;
  heuristic(): number;
}

export type ScoreFactory<Goal extends IGoal> =
  (goal: Goal) => (data: IData) => IScore;

export type NodeFactory<Data extends IData, Node extends INode<Data>> = (parent: Node, data: Data) => Node;

export interface INode<Data extends IData> {
  depth: number;
  data: Data;
  parent: INode<IData>;
  id(): string;
  compareF(other: INode<Data>): number;
  reconstruct(): Data[];
  succeed(node: INode<Data>): INode<Data>;
}

export interface INodeSuccessors<Data extends IData> {
  of(node: INode<IData>): Iterable<INode<Data>>;
}

export interface ISuccessors<Node extends INode<IData>> {
  (node: Node): Iterable<Node>;
}

export interface IAStar<Data extends IData> {
  search(root: INode<Data>, goal: IGoal): Data[] | null;
}
