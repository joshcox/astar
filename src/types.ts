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

export type ScoreFactory<Score extends IScore> = (data: IData) => Score;

export interface INode<Data extends IData> {
  depth: number;
  data: Data;
  parent: INode<IData>;
  g(): number;
  h(): number;
  f(): number;
  id(): string;
  compareF(other: INode<Data>): number;
  reconstruct(): Data[];
  succeed(node: INode<Data>): INode<Data>;
}

export type GetData<Node extends INode<IData>> = Node extends INode<infer Data> ? Data : never;

export type NodeFactory<Node extends INode<IData>> = (parent: Node, data: GetData<Node>) => Node;

export interface ISuccessors<Node extends INode<IData>> {
  (node: Node): Iterable<Node>;
}

export interface IAStar<Data extends IData> {
  search(root: INode<Data>, goal: IGoal): Data[] | null;
}
