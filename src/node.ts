import { memoize } from "./memoize";
import { cost, heuristic } from "./score";
import { IData, INode, IScore } from "./types";

/**
 * Represents a node in the A* search algorithm tree.
 * This class is a core component of the A* implementation, storing data, managing relationships between nodes,
 * and calculating various scores used in the search process.
 *
 * @template Data - Type extending IData, representing the data stored in each node
 * @implements {INode}
 */
export class Node<Data extends IData> implements INode {
  /** The depth of the node in the search tree */
  public depth: number;

  /** Array of child nodes */
  public children: Node<Data>[] = [];

  /**
   * Creates a new Node instance.
   *
   * @param {Node<Data>} parent - The parent node in the search tree
   * @param {Data} data - The data associated with this node
   * @param {IScore} score - The score object used for A* calculations
   */
  constructor(
    public parent: Node<Data>,
    public data: Data,
    private score: IScore,
  ) {
    this.depth = this instanceof Root ? 0 : this.parent.depth + 1;
  }

  /**
   * Generates a unique identifier for the node based on its ancestors' data IDs.
   * This is useful for comparing and identifying nodes in the search tree.
   *
   * @returns {string} A unique string identifier for the node
   */
  public id(): string {
    return [...this.ancestors()].map(node => node.data.id).sort().join('.');
  }

  /**
   * Calculates the cost to reach this node from the start node (g-score).
   * The result is memoized for performance optimization.
   *
   * @returns {number} The g-score of the node
   */
  @memoize
  public g(): number {
    return cost(this.score);
  }

  @memoize
  private gStar(): number {
    let g = 0;
    for (const node of this.ancestors()) g += node.g();
    return g;
  }

  /**
   * Calculates the estimated cost from this node to the goal (h-score).
   * The result is memoized for performance optimization.
   *
   * @returns {number} The h-score of the node
   */
  @memoize
  public h(): number {
    return heuristic(this.score);
  }

  /**
   * Calculates the total estimated cost of the path through this node (f-score).
   * F-score is the sum of g-scores of all ancestors plus this node's h-score.
   *
   * @returns {number} The f-score of the node
   */
  public f(): number {
    return this.gStar() + this.h();
  }

  /**
   * Compares this node's f-score with another node's f-score.
   * Used for sorting nodes in the priority queue.
   *
   * @param {Node<Data>} other - The node to compare against
   * @returns {number} Negative if this node has a lower f-score, positive if higher, zero if equal
   */
  public compareF(other: Node<Data>): number {
    return this.f() - other.f();
  }

  /**
   * Adds a child node to this node's children array.
   *
   * @param {Node<Data>} node - The child node to add
   * @returns {Node<Data>} The added child node
   */
  public addChild(node: Node<Data>): Node<Data> {
    this.children.push(node);
    return node;
  }

  /**
   * Generates an iterable of all ancestor nodes, including this node.
   * Useful for calculating cumulative scores and reconstructing paths.
   *
   * @returns {Iterable<Node<Data>>} An iterable of ancestor nodes
   * @private
   */
  private * ancestors(): Iterable<Node<Data>> {
    let node: Node<Data> = this;
    while (!(node instanceof Root)) {
      yield node;
      node = node.parent;
    }
  }

  /**
   * Reconstructs the path from the root to this node.
   * Used to return the solution path once the goal is reached.
   *
   * @returns {Data[]} An array of Data objects representing the path from root to this node
   */
  public reconstruct(): Data[] {
    return [...this.ancestors()].map(node => node.data).reverse();
  }
}

/**
 * Represents the root node in the A* search tree.
 * This class extends Node and is used as the starting point for the search.
 *
 * @template Data - Type extending IData, representing the data stored in the root node
 * @extends {Node<Data>}
 */
export class Root<Data extends IData> extends Node<Data> {
  /**
   * Creates a new Root instance.
   * Initializes with null parent, a root data object, and null score.
   */
  constructor() {
    super(<Node<Data>><unknown>null, <Data>{ id: 'root' }, <IScore><unknown>null);
  }
}
