import { describe, it, expect } from 'vitest';
import { OpportunityStage } from './opportunityStageModel';

describe('OpportunityStage Enum', () => {
  describe('Enum Values', () => {
    it('should have None stage with value 0', () => {
      expect(OpportunityStage.None).toBe(0);
    });

    it('should have Stage A with value 1', () => {
      expect(OpportunityStage.A).toBe(1);
    });

    it('should have Stage B with value 2', () => {
      expect(OpportunityStage.B).toBe(2);
    });

    it('should have Stage C with value 3', () => {
      expect(OpportunityStage.C).toBe(3);
    });

    it('should have Stage D with value 4', () => {
      expect(OpportunityStage.D).toBe(4);
    });
  });

  describe('Enum Ordering', () => {
    it('should have stages in ascending order', () => {
      expect(OpportunityStage.None).toBeLessThan(OpportunityStage.A);
      expect(OpportunityStage.A).toBeLessThan(OpportunityStage.B);
      expect(OpportunityStage.B).toBeLessThan(OpportunityStage.C);
      expect(OpportunityStage.C).toBeLessThan(OpportunityStage.D);
    });

    it('should support stage progression', () => {
      const stages = [
        OpportunityStage.None,
        OpportunityStage.A,
        OpportunityStage.B,
        OpportunityStage.C,
        OpportunityStage.D
      ];

      for (let i = 0; i < stages.length - 1; i++) {
        expect(stages[i]).toBeLessThan(stages[i + 1]);
      }
    });
  });

  describe('Enum Usage', () => {
    it('should be usable in type definitions', () => {
      interface Opportunity {
        id: number;
        stage: OpportunityStage;
      }

      const opportunity: Opportunity = {
        id: 1,
        stage: OpportunityStage.A
      };

      expect(opportunity.stage).toBe(OpportunityStage.A);
      expect(opportunity.stage).toBe(1);
    });

    it('should support stage comparison', () => {
      const currentStage = OpportunityStage.B;
      const targetStage = OpportunityStage.D;

      expect(currentStage).toBeLessThan(targetStage);
    });

    it('should support stage equality check', () => {
      const stage1 = OpportunityStage.C;
      const stage2 = OpportunityStage.C;
      const stage3 = OpportunityStage.D;

      expect(stage1).toBe(stage2);
      expect(stage1).not.toBe(stage3);
    });
  });

  describe('Stage Transitions', () => {
    it('should support moving from None to A', () => {
      let currentStage = OpportunityStage.None;
      currentStage = OpportunityStage.A;

      expect(currentStage).toBe(OpportunityStage.A);
    });

    it('should support progressive stage advancement', () => {
      const stages = [
        OpportunityStage.None,
        OpportunityStage.A,
        OpportunityStage.B,
        OpportunityStage.C,
        OpportunityStage.D
      ];

      let currentStage = OpportunityStage.None;

      for (let i = 1; i < stages.length; i++) {
        currentStage = stages[i];
        expect(currentStage).toBe(stages[i]);
      }
    });
  });

  describe('Stage Validation', () => {
    it('should validate stage is within range', () => {
      const validStages = [
        OpportunityStage.None,
        OpportunityStage.A,
        OpportunityStage.B,
        OpportunityStage.C,
        OpportunityStage.D
      ];

      validStages.forEach(stage => {
        expect(stage).toBeGreaterThanOrEqual(0);
        expect(stage).toBeLessThanOrEqual(4);
      });
    });

    it('should identify None as initial stage', () => {
      const initialStage = OpportunityStage.None;
      expect(initialStage).toBe(0);
    });

    it('should identify D as final stage', () => {
      const finalStage = OpportunityStage.D;
      expect(finalStage).toBe(4);
    });
  });

  describe('Stage Mapping', () => {
    it('should map numeric values to stages', () => {
      const stageMap: Record<number, OpportunityStage> = {
        0: OpportunityStage.None,
        1: OpportunityStage.A,
        2: OpportunityStage.B,
        3: OpportunityStage.C,
        4: OpportunityStage.D
      };

      expect(stageMap[0]).toBe(OpportunityStage.None);
      expect(stageMap[1]).toBe(OpportunityStage.A);
      expect(stageMap[2]).toBe(OpportunityStage.B);
      expect(stageMap[3]).toBe(OpportunityStage.C);
      expect(stageMap[4]).toBe(OpportunityStage.D);
    });

    it('should support stage name retrieval', () => {
      const stageName = (stage: OpportunityStage): string => {
        switch (stage) {
          case OpportunityStage.None:
            return 'None';
          case OpportunityStage.A:
            return 'Stage A';
          case OpportunityStage.B:
            return 'Stage B';
          case OpportunityStage.C:
            return 'Stage C';
          case OpportunityStage.D:
            return 'Stage D';
          default:
            return 'Unknown';
        }
      };

      expect(stageName(OpportunityStage.None)).toBe('None');
      expect(stageName(OpportunityStage.A)).toBe('Stage A');
      expect(stageName(OpportunityStage.D)).toBe('Stage D');
    });
  });

  describe('Edge Cases', () => {
    it('should handle stage as array index', () => {
      const stageLabels = ['None', 'Stage A', 'Stage B', 'Stage C', 'Stage D'];
      
      expect(stageLabels[OpportunityStage.None]).toBe('None');
      expect(stageLabels[OpportunityStage.A]).toBe('Stage A');
      expect(stageLabels[OpportunityStage.D]).toBe('Stage D');
    });

    it('should support stage arithmetic', () => {
      const currentStage = OpportunityStage.B;
      const nextStage = currentStage + 1;

      expect(nextStage).toBe(OpportunityStage.C);
    });

    it('should handle stage in switch statements', () => {
      const getStageDescription = (stage: OpportunityStage): string => {
        switch (stage) {
          case OpportunityStage.None:
            return 'No stage assigned';
          case OpportunityStage.A:
            return 'Initial qualification';
          case OpportunityStage.B:
            return 'Proposal development';
          case OpportunityStage.C:
            return 'Negotiation';
          case OpportunityStage.D:
            return 'Final approval';
          default:
            return 'Unknown stage';
        }
      };

      expect(getStageDescription(OpportunityStage.None)).toBe('No stage assigned');
      expect(getStageDescription(OpportunityStage.A)).toBe('Initial qualification');
      expect(getStageDescription(OpportunityStage.D)).toBe('Final approval');
    });
  });

  describe('Type Safety', () => {
    it('should enforce type safety', () => {
      const setStage = (stage: OpportunityStage): OpportunityStage => {
        return stage;
      };

      expect(setStage(OpportunityStage.A)).toBe(OpportunityStage.A);
      expect(setStage(OpportunityStage.C)).toBe(OpportunityStage.C);
    });

    it('should work with arrays', () => {
      const stages: OpportunityStage[] = [
        OpportunityStage.A,
        OpportunityStage.B,
        OpportunityStage.C
      ];

      expect(stages.length).toBe(3);
      expect(stages[0]).toBe(OpportunityStage.A);
      expect(stages[2]).toBe(OpportunityStage.C);
    });
  });
});
