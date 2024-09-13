import { score, Score, Cost, Heuristic, verboseScore } from "./score";
import { IScore, IScoreWeights } from "./types";

@Score
class TestScore implements IScore {
  constructor(public weights: IScoreWeights) { }

  public cost() {
    return 10;
  }

  public heuristic() {
    return 20;
  }

  @Cost.Penalty
  public costPenalty() {
    return 1;
  }

  @Cost.Discount
  public costDiscount() {
    return 1;
  }

  @Heuristic.Penalty
  public heuristicPenalty() {
    return 1;
  }

  @Heuristic.Discount
  public heuristicDiscount() {
    return 1;
  }
}

describe('score calculations', () => {
  describe('getting a score', () => {
    it('can apply cost discount modifiers', () => {
      const testScore = new TestScore({
        cost: {
          discount: {
            costDiscount: 1
          }
        }
      });

      expect(score(testScore)).toBe(29);
    });

    it('can apply cost penalty modifiers', () => {
      const testScore = new TestScore({
        cost: {
          penalty: {
            costPenalty: 1
          }
        }
      });

      expect(score(testScore)).toBe(31);
    });

    it('can apply heuristic discount modifiers', () => {
      const testScore = new TestScore({
        heuristic: {
          discount: {
            heuristicDiscount: 1
          }
        }
      });

      expect(score(testScore)).toBe(29);
    });

    it('can apply heuristic penalty modifiers', () => {
      const testScore = new TestScore({
        heuristic: {
          penalty: {
            heuristicPenalty: 1
          }
        }
      });

      expect(score(testScore)).toBe(31);
    });

    it('can apply multiple modifiers', () => {
      const testScore = new TestScore({
        cost: {
          discount: {
            costDiscount: 1
          },
          penalty: {
            costPenalty: 1
          }
        },
        heuristic: {
          discount: {
            heuristicDiscount: 1
          },
          penalty: {
            heuristicPenalty: 1
          }
        }
      });

      expect(score(testScore)).toBe(30);
    });
  });

  describe('getting averbose score', () => {
    it('can pull detailed information about each modifier', () => {
      const testScore = new TestScore({
        cost: {
          discount: {
            costDiscount: 1
          },
          penalty: {
            costPenalty: 1
          }
        },
        heuristic: {
          discount: {
            heuristicDiscount: 1
          },
          penalty: {
            heuristicPenalty: 1
          }
        }
      });

      expect(verboseScore(testScore).subScores).toEqual({
        baseCost: 10,
        baseHeuristic: 20,
        modifiers: {
          cost: {
            discount: {
              costDiscount: 1
            },
            penalty: {
              costPenalty: 1
            }
          },
          heuristic: {
            discount: {
              heuristicDiscount: 1
            },
            penalty: {
              heuristicPenalty: 1
            }
          }
        }
      });
    });
  });

});
