import { IData, IGoal, IScore, IScoreConstructor, IScoreFactory, IScoreOptions } from "types";


export class ScoreFactory implements IScoreFactory {
  constructor(
    private Score: IScoreConstructor,
    private options: IScoreOptions
  ) { }

  createScore(goal: IGoal, data: IData): IScore {
    return new this.Score(data, goal, this.options);
  }
}
