import TinyQueue from "tinyqueue";

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


const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;
export function assertsIsDefined<T>(value: T | undefined | null): asserts value is T {
  if (!isDefined(value)) {
    throw new Error('Value is unexpectedly undefined');
  }
}

export type SubScoreTypes = 'cost_discount' | 'cost_penalty' | 'heuristic_discount' | 'heuristic_penalty';

export type SubScoreMetadata = { type: SubScoreTypes, key: string, method: () => number };

function SubScore(type: SubScoreTypes): MethodDecorator {
  return (target: any, key: string | symbol, descriptor: PropertyDescriptor): void => {
    const weightName = typeof key === 'string'
      ? key
      : key.description;

    const originalMethod = descriptor.value;
    descriptor.value = function (this: Score, ...args: any[]): number {
      let weights: Record<string, number>;

      switch (type) {
        case 'cost_discount':
          weights = this.options.cost.discounts;
          break;
        case 'cost_penalty':
          weights = this.options.cost.penalties;
          break;
        case 'heuristic_discount':
          weights = this.options.heuristic.discounts;
          break;
        case 'heuristic_penalty':
          weights = this.options.heuristic.penalties;
          break;
        default:
          throw new Error(`Unknown subscore type: ${type}`);
      }

      return originalMethod.apply(this, args) * (weights[weightName] ?? 0);
    };

    Reflect.defineMetadata(CALCULATOR_METHODS, [
      ...(Reflect.getMetadata(CALCULATOR_METHODS, target) || []),
      {
        type,
        key: weightName,
        method: descriptor.value,
      } satisfies SubScoreMetadata,
    ], target);
  };
}

function Binary(_: any, __: string | symbol, descriptor: PropertyDescriptor): void {
  const originalMethod = descriptor.value;

  descriptor.value = function (this: Score, ...args: any[]): number {
    return originalMethod.apply(this, args) ? 1 : 0;
  };
}

export const SubScoreDecorators = {
  Binary,
  G: {
    Discount: SubScore('cost_discount'),
    Penalty: SubScore('cost_penalty'),
  },
  H: {
    Discount: SubScore('heuristic_discount'),
    Penalty: SubScore('heuristic_penalty')
  }
};


export const CALCULATOR_METHODS = Symbol('Calculators');

export abstract class Score implements IScore {
  abstract baseCost(): number;
  abstract baseHeuristic(): number;

  constructor(
    protected readonly data: IData,
    protected readonly goal: IGoal,
    public options: IScoreOptions,
  ) {
    (Reflect.getMetadata(CALCULATOR_METHODS, this.constructor.prototype) || [])
      .forEach(this.registerSubscore);
  }

  static Sub = SubScoreDecorators;

  private subScores = {
    cost: {
      discounts: <Array<() => number>>[],
      penalties: <Array<() => number>>[],
    },
    heuristic: {
      penalties: <Array<() => number>>[],
      discounts: <Array<() => number>>[],
    },
  };

  private registerSubscore = ({ type, method }: { type: SubScoreTypes, method: () => number }): number => {
    const boundMethod = method.bind(this);
    switch (type) {
      case 'cost_discount':
        return this.subScores.cost.discounts.push(boundMethod);
      case 'cost_penalty':
        return this.subScores.cost.penalties.push(boundMethod);
      case 'heuristic_discount':
        return this.subScores.heuristic.discounts.push(boundMethod);
      case 'heuristic_penalty':
        return this.subScores.heuristic.penalties.push(boundMethod);
      default: {
        throw new Error(`Unknown calculator type: ${type}`);
      }
    }
  };

  public cost(): number {
    return this.baseCost() - this.calculateCostDiscount();
  }

  private calculateCostDiscount(): number {
    const discounts = this.subScores.cost.discounts;
    return Math.max(discounts.reduce((acc, d) => acc + d(), 0), 0);
  }

  public heuristic(): number {
    return this.baseHeuristic() + this.calculateHeuristicPenalty();
  }

  private calculateHeuristicPenalty(): number {
    const penalties = this.subScores.heuristic.penalties;
    return Math.max(penalties.reduce((acc, p) => acc + p(), 0), 0);
  }
}


export class ScoreFactory implements IScoreFactory {
  constructor(
    private Score: IScoreConstructor,
    protected options: IScoreOptions
  ) { }

  createScore(goal: IGoal, data: IData): IScore {
    return new this.Score(data, goal, this.options);
  }
}

export class Node<Data extends IData> implements INode {
  public depth: number;
  public children: Node<Data>[] = [];

  constructor(
    public parent: Node<Data>,
    public data: Data,
    private score: IScore,
  ) {
    this.depth = this.parent.depth + 1;
  }

  public id(): string {
    let ids = [this.data.id];
    for (const ancestor of this.ancestors()) {
      ids.push(ancestor.data.id);
    }
    return ids.sort().join('.');
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
}

export class NodeFactory<Data extends IData> implements INodeFactory {
  constructor(
    public scoreFactory: IScoreFactory,
    private successorDataFactory: (node: Node<Data>) => Data[]
  ) { }

  public createRoot(): Node<Data> {
    return new Root();
  }

  public createChild(parent: Node<Data>, goal: IGoal, data: Data): Node<Data> {
    const child = new Node(parent, data, this.scoreFactory.createScore(goal, data));
    parent.addChild(child);
    return child;
  }

  public successors(goal: IGoal, node: Node<Data>): Node<Data>[] {
    return this.successorDataFactory(node).map(data => node.addChild(this.createChild(node, goal, data)));
  }
}

export class NodeSet<Node extends INode> {
  protected ids = new Set<string>();

  public get length() {
    return this.ids.size;
  }

  public has(node: Node) {
    return this.ids.has(node.id());
  }

  public push(node: Node): NodeSet<Node> {
    this.ids.add(node.id());
    return this;
  }
}

export class NodeQueue<Node extends INode> extends NodeSet<Node> {
  private queue = new TinyQueue<Node>([], (a, b) => a.compareF(b));

  public get length() {
    return this.queue.length;
  }

  public push(node: Node): NodeQueue<Node> {
    this.queue.push(node);
    this.ids.add(node.id());
    return this;
  }

  public pop(): Node | undefined {
    const node = this.queue.pop();
    assertsIsDefined(node);
    this.ids.delete(node.id());
    return node;
  }
}



export class AStar<Data extends IData>{
  constructor(private nodeFactory: NodeFactory<Data>) { }

  public searchFromRoot(goal: IGoal): Data[] | null {
    return this.search(this.nodeFactory.createRoot(), goal);
  }

  public search(root: Node<Data>, goal: IGoal): Data[] | null {
    const open = new NodeQueue<Node<Data>>().push(root);
    const closed = new NodeSet<Node<Data>>();

    while (open.length > 0) {
      const node = open.pop();
      // If the node has already been evaluated, skip it
      if (closed.has(node)) {
        continue;
      }
      // If the node satisfies the goal, return the whole path
      if (goal.satisfiedBy(node)) {
        return <Data[]>node.reconstruct();
      }
      // Add unsatisfying node to the closed list
      closed.push(node);
      for (const successor of this.nodeFactory.successors(goal, node)) {
        // If the successor is already queued, skip it
        if (open.has(successor)) {
          continue;
        }
        open.push(successor);
      }
    }

    return null;
  }
}

// BEGIN USAGE
class Data implements IData {
  id: string;
  exercise: { slug: string };
}

class Goal implements IGoal {
  satisfiedBy(node: Node<Data>): boolean {
    return !!node;
  }
  size: number;
}

class SelectorScore extends Score {
  declare goal: Goal;
  declare data: Data;

  public baseCost = () => 1;
  public baseHeuristic = () => (this.goal.size ?? 0) - this.data.id.length;

  @Score.Sub.G.Discount
  @Score.Sub.Binary
  public squat(): boolean {
    return this.data.exercise.slug === 'squat';
  }

  @Score.Sub.H.Penalty
  @Score.Sub.Binary
  public anyUnilaterals(): boolean {
    return false;
  }
}

export class Selector {
  constructor(
    private candidateSet: { slug: string }[],
    private scoreOptions: IScoreOptions
  ) { }

  private successorDataFactory = (_node: Node<Data>): Data[] =>
    this.candidateSet.map(exercise => ({ id: exercise.slug, exercise }));

  public select(goal: Goal): Data[] | null {
    return new AStar(
      new NodeFactory(
        new ScoreFactory(SelectorScore, this.scoreOptions),
        this.successorDataFactory
      )
    ).searchFromRoot(goal);
  }
}

const result2 = new Selector([], {
  cost: {
    discounts: { squat: 0.5 },
    penalties: {},
  },
  heuristic: {
    discounts: {},
    penalties: {
      anyUnilaterals: 0.5
    },
  },
}).select(new Goal());
console.log(result2);

// END USAGE
