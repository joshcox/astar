import { NodeSet } from "./node.set";
import { assertsIsDefined } from "./assertions";
import TinyQueue from "tinyqueue";
import { INode } from "./types";

/**
 * NodeQueue class represents a priority queue of nodes used in the A* search algorithm.
 * It extends the NodeSet class and uses TinyQueue for efficient priority queue operations.
 *
 * This class plays a crucial role in the A* algorithm by:
 * 1. Maintaining a priority queue of nodes based on their f-score
 * 2. Ensuring efficient insertion and removal of nodes
 * 3. Keeping track of unique node IDs
 *
 * The NodeQueue is typically used as the "open set" in the A* algorithm,
 * storing nodes that are candidates for exploration.
 *
 * @template Node - Type extending INode, representing the node objects stored in the queue
 */
export class NodeQueue<Node extends INode> {
  private queue = new TinyQueue<Node>([], (a, b) => a.compareF(b));
  private set = new NodeSet<Node>();

  /**
   * Gets the current number of nodes in the queue.
   *
   * @returns {number} The number of nodes in the queue
   */
  public get length(): number {
    return this.queue.length;
  }

  /**
   * Checks if a given node exists in the queue.
   *
   * @param {Node} node - The node to check for existence in the queue.
   * @returns {boolean} True if the node exists in the queue, false otherwise.
   */
  public has(node: Node): boolean {
    return this.set.has(node);
  }

  /**
   * Pushes a new node into the queue.
   * This method adds the node to both the priority queue and the set of node IDs.
   *
   * @param {Node} node - The node to be added to the queue
   * @returns {NodeQueue<Node>} The current NodeQueue instance (for method chaining)
   */
  public push(node: Node): NodeQueue<Node> {
    this.queue.push(node);
    this.set.add(node);
    return this;
  }

  /**
   * Removes and returns the node with the lowest f-score from the queue.
   * This method also removes the node's ID from the set of node IDs.
   *
   * @returns {Node | undefined} The node with the lowest f-score, or undefined if the queue is empty
   * @throws {Error} If the popped node is undefined (which should never happen in normal operation)
   */
  public pop(): Node | undefined {
    const node = this.queue.pop();
    assertsIsDefined(node);
    this.set.delete(node);
    return node;
  }
}
