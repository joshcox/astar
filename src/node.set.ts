import { INode } from "./types";

/**
 * NodeSet class represents a collection of unique nodes in the A* search algorithm.
 * It provides basic set operations for managing nodes, ensuring that each node
 * is uniquely identified by its ID.
 *
 * This class plays a crucial role in the A* algorithm by:
 * 1. Maintaining a set of unique node IDs
 * 2. Providing methods to check for node existence
 * 3. Allowing the addition of new nodes to the set
 *
 * The NodeSet is used in conjunction with other components of the A* algorithm,
 * such as the open and closed lists, to efficiently manage and track nodes during the search process.
 *
 * @template Node - Type extending INode, representing the node objects stored in the set
 */
export class NodeSet<Node extends INode> {
  /**
   * A Set containing the unique IDs of nodes in the collection.
   * @private
   */
  protected ids = new Set<string>();

  /**
   * Gets the number of nodes in the set.
   *
   * @returns {number} The number of nodes in the set.
   */
  public get length(): number {
    return this.ids.size;
  }

  /**
   * Checks if a given node exists in the set.
   *
   * @param {Node} node - The node to check for existence in the set.
   * @returns {boolean} True if the node exists in the set, false otherwise.
   */
  public has(node: Node): boolean {
    return this.ids.has(node.id());
  }

  /**
   * Adds a new node to the set.
   * If the node's ID already exists in the set, it will not be added again.
   *
   * @param {Node} node - The node to add to the set.
   * @returns {NodeSet<Node>} The current NodeSet instance, allowing for method chaining.
   */
  public add(node: Node): NodeSet<Node> {
    this.ids.add(node.id());
    return this;
  }

  /**
   * Removes a node from the set.
   *
   * @param {Node} node - The node to remove from the set.
   * @returns {boolean} True if the node was successfully removed, false otherwise.
   */
  public delete(node: Node): boolean {
    return this.ids.delete(node.id());
  }
}
