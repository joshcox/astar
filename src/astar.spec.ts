import { ContrivedData, createContrivedStar, FailureGoal, SuccessGoal } from '../examples/contrived';

const contrivedStar = createContrivedStar();

describe('Successes and Failures', () => {
  describe('searchFromRoot', () => {
    it('returns null when the goal is unreachable', () => {
      expect(contrivedStar.searchFromRoot(new FailureGoal())).toBeNull();
    });

    it('returns a path when the goal is reachable', () => {
      expect(contrivedStar.searchFromRoot(new SuccessGoal())).not.toBeNull();
    });
  });

  describe('search', () => {
    it('returns null when the goal is unreachable', () => {
      expect(contrivedStar.search(new ContrivedData(), new FailureGoal())).toBeNull();
    });

    it('return a path when the goal is reachable', () => {
      expect(contrivedStar.search(new ContrivedData(), new SuccessGoal())).not.toBeNull();
    });
  });
});
