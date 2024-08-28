/**
 * @module AStar
 * @description
 * This module implements the A* search algorithm, a popular pathfinding and graph traversal algorithm.
 * It is used to efficiently find the optimal path between a start node and a goal node in a graph or grid.
 *
 * The A* algorithm is an informed search algorithm, meaning it uses heuristics to guide its search.
 * It combines the benefits of Dijkstra's algorithm (which finds the shortest path) and greedy best-first search
 * (which uses heuristics to try to move closer to the goal with each step).
 *
 * This implementation is generic and can be used with various types of data and goal conditions,
 * making it versatile for different pathfinding scenarios.
 *
 * @template Data - The type of data stored in each node, must extend IData
 * @template Goal - The type representing the goal condition, must extend IGoal
 */

import { NodeSet } from "./node.set";
import { NodeFactory } from "./node.factory";
import { IData, IGoal, IScore, IScoreConstructor, IScoreOptions } from "./types";
import { NodeQueue } from "./node.queue";
import { Node } from "./node";
import { ScoreFactory } from "./score.factory";
import { assertsIsDefined } from "./assertions";

/**
 * Configuration options for the AStar algorithm.
 * @interface AStarOptions
 * @template Data - The type of data stored in each node, must extend IData
 * @template Goal - The type representing the goal condition, must extend IGoal
 */
interface AStarOptions<Data extends IData, Goal extends IGoal> {
  /**
   * Constructor for creating score objects used in the algorithm.
   */
  Score: IScoreConstructor<Data, Goal, IScore>;

  /**
   * Options for configuring the scoring mechanism.
   */
  scoreOptions: IScoreOptions;

  /**
   * Function to generate successor nodes for a given node.
   * @param node - The current node
   * @returns An array of Data objects representing possible next states
   */
  successors: (node: Node<Data>) => Data[];
}

/**
 * An implementation of the A* search algorithm that can be flexibly utilized for various domains.
 * @class AStar
 * @template Data - The type of data stored in each node, must extend IData
 * @template Goal - The type representing the goal condition, must extend IGoal
 */
export class AStar<Data extends IData, Goal extends IGoal> {
  private nodeFactory: NodeFactory<Data>;

  /**
   * Creates an instance of the AStar class.
   * @param {AStarOptions<Data, Goal>} options - Configuration options for the A* algorithm
   */
  constructor(options: AStarOptions<Data, Goal>) {
    this.nodeFactory = new NodeFactory(
      new ScoreFactory(options.Score, options.scoreOptions),
      options.successors
    );
  }

  /**
   * Performs an A* search starting from a root node.
   * @param {IGoal} goal - The goal condition to satisfy
   * @returns {Data[] | null} An array of Data objects representing the path to the goal, or null if no path is found
   */
  public searchFromRoot(goal: IGoal): Data[] | null {
    return this._search(this.nodeFactory.createRoot(), goal);
  }

  /**
   * Performs an A* search starting from a specified start node.
   * @param {Data} start - The starting node data
   * @param {IGoal} goal - The goal condition to satisfy
   * @returns {Data[] | null} An array of Data objects representing the path from start to goal, or null if no path is found
   */
  public search(start: Data, goal: IGoal): Data[] | null {
    const root = this.nodeFactory.createRoot();
    return this._search(this.nodeFactory.createChild(root, goal, start), goal);
  }

  /**
   * Internal method that implements the core A* search algorithm.
   * @private
   * @param {Node<Data>} start - The starting node
   * @param {IGoal} goal - The goal condition to satisfy
   * @returns {Data[] | null} An array of Data objects representing the path to the goal, or null if no path is found
   */
  private _search(start: Node<Data>, goal: IGoal) {
    const open = new NodeQueue<Node<Data>>().push(start);
    const closed = new NodeSet<Node<Data>>();

    while (open.length > 0) {
      const node = open.pop();
      assertsIsDefined(node);
      // If the node has already been evaluated, skip it
      if (closed.has(node)) {
        continue;
      }
      // If the node satisfies the goal, return the whole path
      if (goal.satisfiedBy(node)) {
        return node.reconstruct();
      }
      // Add unsatisfying node to the closed list
      closed.add(node);
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
