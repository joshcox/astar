import { Binary, CALCULATOR_METHODS, Discount, Penalty } from "score.decorators";
import { IGoal, INode, IScore, NodeScoreFactory } from "types";

interface ScoreOptions {
  defaultCost: number;
  discounts: Record<string, number>;
  penalties: Record<string, number>;
}

type Calculator = () => number;

interface Cost {
  discounts: Array<Calculator>;
}

interface Heuristic {
  penalties: Array<Calculator>;
}

export abstract class Score implements IScore {
  static Binary = Binary

  static Cost = {
    Discount,
  };

  static Heuristic = {
    Penalty
  };

  constructor(
    protected readonly node: INode<any>,
    protected readonly goal: IGoal,
    public options: ScoreOptions,
  ) {
    (Reflect.getMetadata(CALCULATOR_METHODS, this.constructor.prototype) || [])
      .forEach(this.categorizeCalculator);
  }

  static factory(
    this: new (node: INode<any>, goal: IGoal, options: ScoreOptions) => IScore,
    options: ScoreOptions,
  ): NodeScoreFactory<IGoal, INode<any>> {
    return goal => node => new this(node, goal, options);
  }

  private _cost: Cost = {
    discounts: [],
  };

  private _heuristic: Heuristic = {
    penalties: [],
  };

  private categorizeCalculator = ({ type, method }: any) => {
    if (type === 'discount') {
      this._cost.discounts.push(method.bind(this));
    } else if (type === 'penalty') {
      this._heuristic.penalties.push(method.bind(this));
    }
  };

  public cost(): number {
    return this.node.isRoot ? 0 : (
      this.options.defaultCost - this.calculateCostDiscount()
    );
  }

  private calculateCostDiscount(): number {
    return Math.max(
      this._cost.discounts.reduce((acc, discount) => acc + discount(), 0),
      0,
    );
  }

  public heuristic(): number {
    return this.node.isRoot ? 0 : (
      this.goal.size - this.node.depth + this.calculateHeuristicPenalty()
    );
  }

  private calculateHeuristicPenalty(): number {
    return Math.max(
      this._heuristic.penalties.reduce((acc, penalty) => acc + penalty(), 0),
      0,
    );
  }
}
