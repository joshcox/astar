import { IData, INode, IScore } from "./types";

export class Node<Data extends IData> implements INode {
  public depth: number;
  public children: Node<Data>[] = [];

  constructor(
    public parent: Node<Data>,
    public data: Data,
    private score: IScore,
  ) {
    this.depth = (this.parent?.depth ?? 0) + 1;
  }

  public id(): string {
    let ids = [this.data.id];
    for (const ancestor of this.ancestors()) {
      ids.push(ancestor.data.id);
    }
    return ids.join('.');
  }

  private _g: number | null = null;
  public g(): number {
    if (typeof this._g === 'number') return this._g;
    this._g = this.score.cost();
    return this._g;
  }

  private _h: number | null = null;
  public h(): number {
    if (typeof this._h === 'number') return this._h;
    this._h = this.score.heuristic();
    return this._h;
  }

  public f(): number {
    return [...this.ancestors()].reduce((acc, node) => acc + node.g(), 0) + this.h();
  }

  public compareF(other: Node<Data>): number {
    return this.f() - other.f();
  }

  public addChild(node: Node<Data>): Node<Data> {
    this.children.push(node);
    return node;
  }

  private * ancestors(): Iterable<Node<Data>> {
    let node: Node<Data> = this;
    while (!(node.parent instanceof Root)) {
      yield node.parent;
      node = node.parent;
    }
  }

  public reconstruct(): Data[] {
    let data = [this.data];
    for (const ancestor of this.ancestors()) {
      data.push(ancestor.data);
    }
    return data.reverse();
  }
}

export class Root<Data extends IData> extends Node<Data> {
  constructor() {
    super(<Node<Data>>null, <Data>{ id: 'root' }, <IScore>null);
  }
}
