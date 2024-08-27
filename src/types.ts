/**
 * @module types
 * @description
 * This module defines the core interfaces and types used throughout the A* search algorithm implementation.
 * It provides the foundation for the data structures and objects used in the search process,
 * ensuring type safety and consistency across the codebase.
 *
 * The interfaces and types defined here are for:
 * 1. Defining the structure of nodes in the search tree
 * 2. Specifying the requirements for goal states
 * 3. Establishing the scoring system used in the A* algorithm
 * 4. Creating factories for nodes and scores
 *
 * By centralizing these type definitions, this module facilitates easier maintenance,
 * better code organization, and improved collaboration among developers working on the A* implementation.
 */

/**
 * Represents a goal state in the A* search algorithm.
 * Implementations of this interface define the conditions for reaching the goal.
 */
export interface IGoal {
  /**
   * Determines whether a given node satisfies the goal conditions.
   * @param node - The node to check against the goal conditions.
   * @returns True if the node satisfies the goal, false otherwise.
   */
  satisfiedBy(node: INode): boolean;
}

/**
 * Represents the basic data structure for information stored in nodes.
 * All node data must include a unique identifier.
 */
export interface IData {
  /** A unique identifier for the data. */
  id: string;
}

/**
 * Defines the scoring mechanism used in the A* algorithm.
 * Implementations calculate both the cost to reach a node and the heuristic estimate to the goal.
 */
export interface IScore {
  /**
   * Calculates the cost to reach the current node from the start.
   * @returns The cost value.
   */
  cost(): number;

  /**
   * Calculates the heuristic estimate from the current node to the goal.
   * @returns The heuristic value.
   */
  heuristic(): number;
}

/**
 * Specifies the structure for score modification options.
 * These options allow for fine-tuning of the A* algorithm's behavior by adjusting cost and heuristic calculations.
 */
export interface IScoreOptions {
  /** Options for modifying the cost calculation. */
  cost: {
    /** Discount factors to reduce costs for certain conditions. */
    discount: Record<string, number>;
    /** Penalty factors to increase costs for certain conditions. */
    penalty: Record<string, number>;
  },
  /** Options for modifying the heuristic calculation. */
  heuristic: {
    /** Discount factors to reduce heuristic estimates for certain conditions. */
    discount: Record<string, number>;
    /** Penalty factors to increase heuristic estimates for certain conditions. */
    penalty: Record<string, number>;
  }
}

/**
 * Defines the constructor signature for score objects.
 * This type is used to ensure consistency when creating new score instances.
 */
export type IScoreConstructor<Data extends IData, Goal extends IGoal, Score extends IScore> = new (data: Data, goal: Goal, options: IScoreOptions) => Score;

/**
 * Represents a factory for creating score objects.
 * This interface allows for flexible score creation strategies in the A* implementation.
 */
export interface IScoreFactory {
  /**
   * Creates a new score object based on the given goal and data.
   * @param goal - The goal state used to calculate the score.
   * @param data - The data associated with the node being scored.
   * @returns A new IScore instance.
   */
  createScore(goal: IGoal, data: IData): IScore;
}

/**
 * Defines the structure of a node in the A* search tree.
 * Nodes contain data, maintain relationships with other nodes, and provide methods for score calculations.
 */
export interface INode {
  /** The parent node in the search tree. */
  parent: INode;
  /** The data associated with this node. */
  data: IData;
  /** The depth of this node in the search tree. */
  depth: number;
  /** The child nodes of this node. */
  children: INode[];

  /**
   * Generates a unique identifier for the node.
   * @returns A string identifier for the node.
   */
  id(): string;

  /**
   * Calculates the cost to reach this node from the start (g-score).
   * @returns The g-score of the node.
   */
  g(): number;

  /**
   * Calculates the heuristic estimate from this node to the goal (h-score).
   * @returns The h-score of the node.
   */
  h(): number;

  /**
   * Calculates the total estimated cost of the path through this node (f-score).
   * @returns The f-score of the node.
   */
  f(): number;

  /**
   * Compares this node's f-score with another node's f-score.
   * @param other - The node to compare against.
   * @returns A number indicating the comparison result.
   */
  compareF(other: INode): number;

  /**
   * Reconstructs the path from the root to this node.
   * @returns An array of IData objects representing the path.
   */
  reconstruct(): IData[];

  /**
   * Adds a child node to this node.
   * @param node - The child node to add.
   * @returns The added child node.
   */
  addChild(node: INode): INode;
}

/**
 * Represents a factory for creating and managing nodes in the A* search tree.
 * This interface defines methods for node creation and successor generation.
 */
export interface INodeFactory {
  /** The score factory used to create scores for nodes. */
  scoreFactory: IScoreFactory;

  /**
   * Creates the root node of the search tree.
   * @returns The root node.
   */
  createRoot(): INode;

  /**
   * Creates a child node with the given parent, goal, and data.
   * @param parent - The parent node.
   * @param goal - The goal state.
   * @param data - The data for the new node.
   * @returns A new child node.
   */
  createChild(parent: INode, goal: IGoal, data: IData): INode;

  /**
   * Generates successor nodes for a given node and goal.
   * @param goal - The goal state.
   * @param node - The node for which to generate successors.
   * @returns An array of successor nodes.
   */
  successors(goal: IGoal, node: INode): INode[];
}
