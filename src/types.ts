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

type ScoreConstructor<Score extends IScore> = new (node: IData, goal: IGoal, options: any) => Score;

export type ScoreFactory<Score extends IScore> = (data: IData) => Score;

export type ScoreWithFactory<Score extends IScore> = ScoreConstructor<Score> & {
  factory: (goal: IGoal, options: any) => ScoreFactory<Score>;
};

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

export type NodeWithFactory<Node extends INode<IData>, Score extends IScore> = (new (p: Node, d: IData, s: Score) => Node) & {
  factory: (scoreFactory: ScoreFactory<Score>) => NodeFactory<Node>;
  buildRoot: () => Node;
};

export interface ISuccessors<Node extends INode<IData>> {
  (node: Node): Iterable<Node>;
}

export interface IAStar<Data extends IData> {
  search(root: INode<Data>, goal: IGoal): Data[] | null;
}
