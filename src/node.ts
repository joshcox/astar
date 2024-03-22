import { IData, IGoal, INode, IScore, NodeScoreFactory2 } from "types";

export class Node<Data extends IData> implements INode<Data> {
  private score: IScore;
  public depth: number;
  public children: Node<Data>[] = [];
  public isRoot: boolean;

  constructor(
    public parent: Node<Data> | null,
    public data: Data | null,
    private scoreFactory: NodeScoreFactory2<IGoal, INode<IData>>,
  ) {
    this.isRoot = this.parent === null;
    this.depth = this.isRoot ? 0 : this.parent.depth + 1;
    this.score = this.scoreFactory(this);
  }
  public id(): string {
    if (this.isRoot) {
      return '';
    }

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

  public succeed(data: Data): Node<Data> {
    const successor = new Node(this, data, this.scoreFactory);
    this.children.push(successor);
    return successor;
  }

  private * ancestors(): Iterable<Node<Data>> {
    let node: Node<Data> = this;
    if (node.parent !== null) {
      yield node.parent;
      node = node.parent;
    }
    return node;
  }

  public reconstruct(): Data[] {
    let data = [this.data];
    for (const ancestor of this.ancestors()) {
      data.push(ancestor.data);
    }
    return data.reverse()
  }
}
