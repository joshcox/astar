import { IData, IGoal, IScore, IScoreConstructor, IScoreFactory, IScoreOptions } from "./types";

export class ScoreFactory<Data extends IData, Goal extends IGoal> implements IScoreFactory {
  constructor(
    private Score: IScoreConstructor<Data, Goal, IScore>,
    private options: IScoreOptions
  ) { }

  createScore(goal: Goal, data: Data): IScore {
    return new this.Score(data, goal, this.options);
  }
}
