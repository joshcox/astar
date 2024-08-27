import { IData, IGoal, INodeFactory, IScoreFactory } from "./types";
import { Root, Node } from "./node";

/**
 * NodeFactory class is responsible for creating and managing nodes in the A* search algorithm.
 * It implements the INodeFactory interface and provides methods to create root nodes, child nodes,
 * and generate successors for a given node.
 *
 * This class plays a role in the A* search algorithm by:
 * 1. Creating the initial root node
 * 2. Generating child nodes with appropriate scores
 * 3. Producing successor nodes for expanding the search
 *
 * @template Data - Type extending IData, representing the data stored in each node
 * @implements {INodeFactory}
 */
export class NodeFactory<Data extends IData> implements INodeFactory {
  /**
   * Creates an instance of NodeFactory.
   *
   * @param {IScoreFactory} scoreFactory - Factory for creating score objects
   * @param {(node: Node<Data>) => Data[]} successorDataFactory - Function to generate successor data for a given node
   */
  constructor(
    public scoreFactory: IScoreFactory,
    private successorDataFactory: (node: Node<Data>) => Data[]
  ) { }

  /**
   * Creates and returns a root node.
   * The root node is the starting point of the search tree.
   *
   * @returns {Node<Data>} A new root node
   */
  public createRoot(): Node<Data> {
    return new Root();
  }

  /**
   * Creates a child node with the given parent, goal, and data.
   * This method expands the search tree by adding new nodes.
   *
   * @param {Node<Data>} parent - The parent node
   * @param {IGoal} goal - The goal object used to create the score
   * @param {Data} data - The data to be stored in the new node
   * @returns {Node<Data>} A new child node
   */
  public createChild(parent: Node<Data>, goal: IGoal, data: Data): Node<Data> {
    const child = new Node(parent, data, this.scoreFactory.createScore(goal, data));
    parent.addChild(child);
    return child;
  }

  /**
   * Generates an array of successor nodes for a given node and goal.
   * This method expands the search space in the A* algorithm.
   *
   * @param {IGoal} goal - The goal object used to create scores for successor nodes
   * @param {Node<Data>} node - The node for which to generate successors
   * @returns {Node<Data>[]} An array of successor nodes
   */
  public successors(goal: IGoal, node: Node<Data>): Node<Data>[] {
    return this.successorDataFactory(node).map(data => node.addChild(this.createChild(node, goal, data)));
  }
}
