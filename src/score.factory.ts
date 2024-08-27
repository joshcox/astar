import { IData, IGoal, IScore, IScoreConstructor, IScoreFactory, IScoreOptions } from "./types";

/**
 * ScoreFactory class implements the IScoreFactory interface and is responsible for creating
 * score objects used in the A* search algorithm.
 *
 * This class plays a role in the A* implementation by:
 * 1. Encapsulating the logic for creating score objects
 * 2. Providing a consistent interface for score creation across the algorithm
 * 3. Allowing for easy customization of score creation through its constructor parameters
 *
 * @template Data - Type extending IData, representing the data associated with each node
 * @template Goal - Type extending IGoal, representing the goal condition for the search
 * @implements {IScoreFactory}
 */
export class ScoreFactory<Data extends IData, Goal extends IGoal> implements IScoreFactory {
  /**
   * Creates an instance of ScoreFactory.
   *
   * @param {IScoreConstructor<Data, Goal, IScore>} Score - Constructor for creating score objects
   * @param {IScoreOptions} options - Options to be passed to the score constructor
   */
  constructor(
    private Score: IScoreConstructor<Data, Goal, IScore>,
    private options: IScoreOptions
  ) { }

  /**
   * Creates and returns a new score object based on the provided goal and data.
   * This method is used by the A* algorithm to generate scores for each node during the search process.
   *
   * @param {Goal} goal - The goal object used to create the score
   * @param {Data} data - The data associated with the node for which the score is being created
   * @returns {IScore} A new score object
   */
  createScore(goal: Goal, data: Data): IScore {
    return new this.Score(data, goal, this.options);
  }
}
