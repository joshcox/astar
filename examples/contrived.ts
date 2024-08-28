import { AStar } from "../src/astar";
import { Score } from "../src/score";
import { IData, IGoal, IScore } from "../src/types";

export class ContrivedData implements IData {
  id = "contrived";
}

export class FailureGoal implements IGoal {
  satisfiedBy = () => false;
}

export class SuccessGoal implements IGoal {
  satisfiedBy = () => true;
}

@Score
class ContrivedScore implements IScore {
  public cost = () => 0;
  public heuristic = () => 0;
}

export const createContrivedStar = <G extends IGoal>() =>
  new AStar<ContrivedData, G>({
    Score: ContrivedScore,
    scoreOptions: {
      cost: {
        discount: {},
        penalty: {},
      },
      heuristic: {
        discount: {},
        penalty: {},
      },
    },
    successors: () => [],
  });
