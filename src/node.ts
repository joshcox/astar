import { IData, IGoal, INode, IScore, NodeFactory, NodeScoreFactory2 } from "types";

export class Node<Data extends IData> implements INode<Data> {
  public depth: number;
  public children: Node<Data>[] = [];

  constructor(
    public parent: Node<Data>,
    public data: Data,
    private score: IScore,
  ) {
    this.depth = this.parent.depth + 1;
  }

  static factory(
    this: new (p: Node<IData>, d: IData, s: IScore) => Node<IData>,
    scoreFactory: NodeScoreFactory2<IGoal>
  ): NodeFactory<IData, Node<IData>> {
    return (parent, data) => new this(parent, data, scoreFactory(data));
  }

  static buildRoot = () => new Root();

  public id(): string {
    let ids = [this.data.id];
    for (const ancestor of this.ancestors()) {
      ids.push(ancestor.data.id);
    }
    return ids.sort().join('.');
  }

  protected g(): number {
    return this.score.cost();
  }

  private _f: number | null = null;
  public f(): number {
    if (typeof this._f === 'number') return this._f;
    let score = this.g();
    for (const ancestor of this.ancestors()) score += ancestor.g();
    this._f = score + this.score.heuristic();
    return this._f;
  }

  public compareF(other: Node<Data>): number {
    return this.f() - other.f();
  }

  public succeed(node: Node<Data>): Node<Data> {
    this.children.push(node);
    return node;
  }

  private * ancestors(): Iterable<Node<Data>> {
    let node: Node<Data> = this;
    if (!(node.parent instanceof Root)) {
      yield node.parent;
      node = node.parent;
    }
  }

  public reconstruct(): Data[] {
    let data = [this.data];
    for (const ancestor of this.ancestors()) {
      data.push(ancestor.data);
    }
    return data.reverse()
  }
}

export class Root<Data extends IData> extends Node<Data> {
  constructor() {
    super(<Node<Data>>null, <Data>{ id: 'root' }, <IScore>null);
  }

  isRoot: boolean = true;
}
