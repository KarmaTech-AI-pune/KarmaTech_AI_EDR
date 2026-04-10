import { describe, it, expect } from 'vitest';
import {
  GoNoGoDecisionOpportunityModel,
  ScoringCriteria,
  ScoreRange,
  ScoringDescription,
  GoNoGoDecisionOpportunityClass
} from './GoNoGoDecisionOpportunityModel';

describe('GoNoGoDecisionOpportunityModel', () => {
  describe('Type Definition', () => {
    it('should have required properties', () => {
      const model: GoNoGoDecisionOpportunityModel = {
        id: 1,
        typeOfBid: 1,
        sector: 'Technology',
        bdHead: 'John Doe',
        office: 'New York',
        regionalBDHead: 'Jane Smith',
        region: 'North America',
        typeOfClient: 'Enterprise',
        enderFee: '10000',
        emd: '5000',
        opportunityId: 100
      };

      expect(model.id).toBe(1);
      expect(model.opportunityId).toBe(100);
      expect(model.typeOfBid).toBe(1);
    });

    it('should handle null values', () => {
      const model: GoNoGoDecisionOpportunityModel = {
        id: 1,
        typeOfBid: 1,
        sector: null,
        bdHead: null,
        office: null,
        regionalBDHead: null,
        region: null,
        typeOfClient: null,
        enderFee: null,
        emd: null,
        opportunityId: 100
      };

      expect(model.sector).toBeNull();
      expect(model.bdHead).toBeNull();
      expect(model.office).toBeNull();
    });

    it('should have optional properties', () => {
      const model: GoNoGoDecisionOpportunityModel = {
        id: 1,
        typeOfBid: 1,
        sector: 'Technology',
        bdHead: 'John Doe',
        office: 'New York',
        regionalBDHead: 'Jane Smith',
        region: 'North America',
        typeOfClient: 'Enterprise',
        enderFee: '10000',
        emd: '5000',
        opportunityId: 100,
        scoringCriteriaId: 1,
        scoreRangeId: 2,
        scoringDescriptionId: 3
      };

      expect(model.scoringCriteriaId).toBe(1);
      expect(model.scoreRangeId).toBe(2);
      expect(model.scoringDescriptionId).toBe(3);
    });
  });

  describe('Bid Information', () => {
    it('should handle different bid types', () => {
      const bidTypes = [1, 2, 3, 4, 5];

      bidTypes.forEach(bidType => {
        const model: GoNoGoDecisionOpportunityModel = {
          id: 1,
          typeOfBid: bidType,
          sector: 'Technology',
          bdHead: 'John Doe',
          office: 'New York',
          regionalBDHead: 'Jane Smith',
          region: 'North America',
          typeOfClient: 'Enterprise',
          enderFee: '10000',
          emd: '5000',
          opportunityId: 100
        };

        expect(model.typeOfBid).toBe(bidType);
      });
    });

    it('should store financial information', () => {
      const model: GoNoGoDecisionOpportunityModel = {
        id: 1,
        typeOfBid: 1,
        sector: 'Technology',
        bdHead: 'John Doe',
        office: 'New York',
        regionalBDHead: 'Jane Smith',
        region: 'North America',
        typeOfClient: 'Enterprise',
        enderFee: '50000',
        emd: '25000',
        opportunityId: 100
      };

      expect(model.enderFee).toBe('50000');
      expect(model.emd).toBe('25000');
    });
  });

  describe('Regional Information', () => {
    it('should store regional data', () => {
      const model: GoNoGoDecisionOpportunityModel = {
        id: 1,
        typeOfBid: 1,
        sector: 'Healthcare',
        bdHead: 'John Doe',
        office: 'London',
        regionalBDHead: 'Jane Smith',
        region: 'Europe',
        typeOfClient: 'Government',
        enderFee: '10000',
        emd: '5000',
        opportunityId: 100
      };

      expect(model.region).toBe('Europe');
      expect(model.office).toBe('London');
      expect(model.regionalBDHead).toBe('Jane Smith');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined optional fields', () => {
      const model: GoNoGoDecisionOpportunityModel = {
        id: 1,
        typeOfBid: 1,
        sector: 'Technology',
        bdHead: 'John Doe',
        office: 'New York',
        regionalBDHead: 'Jane Smith',
        region: 'North America',
        typeOfClient: 'Enterprise',
        enderFee: '10000',
        emd: '5000',
        opportunityId: 100
      };

      expect(model.scoringCriteriaId).toBeUndefined();
      expect(model.scoreRangeId).toBeUndefined();
      expect(model.opportunityTracking).toBeUndefined();
    });
  });
});

describe('ScoringCriteria Model', () => {
  describe('Type Definition', () => {
    it('should have all required properties', () => {
      const criteria: ScoringCriteria = {
        Id: 1,
        Label: 'Technical Capability',
        ByWhom: 'John Doe',
        ByDate: '2024-01-01',
        Comments: 'Strong technical team',
        Score: 8,
        ShowComments: true
      };

      expect(criteria.Id).toBe(1);
      expect(criteria.Label).toBe('Technical Capability');
      expect(criteria.Score).toBe(8);
      expect(criteria.ShowComments).toBe(true);
    });

    it('should handle different score values', () => {
      const scores = [0, 1, 5, 8, 10];

      scores.forEach(score => {
        const criteria: ScoringCriteria = {
          Id: 1,
          Label: 'Criteria',
          ByWhom: 'User',
          ByDate: '2024-01-01',
          Comments: 'Comment',
          Score: score,
          ShowComments: true
        };

        expect(criteria.Score).toBe(score);
      });
    });

    it('should handle ShowComments flag', () => {
      const criteriaWithComments: ScoringCriteria = {
        Id: 1,
        Label: 'Criteria',
        ByWhom: 'User',
        ByDate: '2024-01-01',
        Comments: 'Visible comment',
        Score: 5,
        ShowComments: true
      };

      const criteriaWithoutComments: ScoringCriteria = {
        Id: 2,
        Label: 'Criteria',
        ByWhom: 'User',
        ByDate: '2024-01-01',
        Comments: 'Hidden comment',
        Score: 5,
        ShowComments: false
      };

      expect(criteriaWithComments.ShowComments).toBe(true);
      expect(criteriaWithoutComments.ShowComments).toBe(false);
    });
  });
});

describe('ScoreRange Model', () => {
  describe('Type Definition', () => {
    it('should have all required properties', () => {
      const scoreRange: ScoreRange = {
        id: 1,
        value: 8,
        label: 'High',
        range: '8-10'
      };

      expect(scoreRange.id).toBe(1);
      expect(scoreRange.value).toBe(8);
      expect(scoreRange.label).toBe('High');
      expect(scoreRange.range).toBe('8-10');
    });

    it('should handle different score ranges', () => {
      const ranges = [
        { value: 2, label: 'Low', range: '0-3' },
        { value: 5, label: 'Medium', range: '4-7' },
        { value: 9, label: 'High', range: '8-10' }
      ];

      ranges.forEach((rangeData, index) => {
        const scoreRange: ScoreRange = {
          id: index + 1,
          value: rangeData.value,
          label: rangeData.label,
          range: rangeData.range
        };

        expect(scoreRange.value).toBe(rangeData.value);
        expect(scoreRange.label).toBe(rangeData.label);
        expect(scoreRange.range).toBe(rangeData.range);
      });
    });
  });
});

describe('ScoringDescription Model', () => {
  describe('Type Definition', () => {
    it('should have all required properties', () => {
      const description: ScoringDescription = {
        id: 1,
        label: 'Risk Assessment',
        high: 'High risk factors identified',
        medium: 'Moderate risk factors',
        low: 'Low risk factors'
      };

      expect(description.id).toBe(1);
      expect(description.label).toBe('Risk Assessment');
      expect(description.high).toBe('High risk factors identified');
      expect(description.medium).toBe('Moderate risk factors');
      expect(description.low).toBe('Low risk factors');
    });

    it('should handle different description levels', () => {
      const description: ScoringDescription = {
        id: 1,
        label: 'Technical Capability',
        high: 'Excellent technical expertise and resources',
        medium: 'Adequate technical capability',
        low: 'Limited technical resources'
      };

      expect(description.high).toContain('Excellent');
      expect(description.medium).toContain('Adequate');
      expect(description.low).toContain('Limited');
    });
  });
});

describe('GoNoGoDecisionOpportunityClass', () => {
  describe('Constructor', () => {
    it('should initialize with empty arrays', () => {
      const instance = new GoNoGoDecisionOpportunityClass();

      expect(instance.scoringCriteria).toEqual([]);
      expect(instance.scoreRanges).toEqual([]);
      expect(instance.scoringDescriptions).toEqual([]);
    });

    it('should have array properties', () => {
      const instance = new GoNoGoDecisionOpportunityClass();

      expect(Array.isArray(instance.scoringCriteria)).toBe(true);
      expect(Array.isArray(instance.scoreRanges)).toBe(true);
      expect(Array.isArray(instance.scoringDescriptions)).toBe(true);
    });
  });

  describe('Array Manipulation', () => {
    it('should allow adding scoring criteria', () => {
      const instance = new GoNoGoDecisionOpportunityClass();
      const criteria: ScoringCriteria = {
        Id: 1,
        Label: 'Test',
        ByWhom: 'User',
        ByDate: '2024-01-01',
        Comments: 'Comment',
        Score: 5,
        ShowComments: true
      };

      instance.scoringCriteria.push(criteria);

      expect(instance.scoringCriteria.length).toBe(1);
      expect(instance.scoringCriteria[0].Label).toBe('Test');
    });

    it('should allow adding score ranges', () => {
      const instance = new GoNoGoDecisionOpportunityClass();
      const scoreRange: ScoreRange = {
        id: 1,
        value: 8,
        label: 'High',
        range: '8-10'
      };

      instance.scoreRanges.push(scoreRange);

      expect(instance.scoreRanges.length).toBe(1);
      expect(instance.scoreRanges[0].label).toBe('High');
    });

    it('should allow adding scoring descriptions', () => {
      const instance = new GoNoGoDecisionOpportunityClass();
      const description: ScoringDescription = {
        id: 1,
        label: 'Risk',
        high: 'High risk',
        medium: 'Medium risk',
        low: 'Low risk'
      };

      instance.scoringDescriptions.push(description);

      expect(instance.scoringDescriptions.length).toBe(1);
      expect(instance.scoringDescriptions[0].label).toBe('Risk');
    });

    it('should allow multiple items in arrays', () => {
      const instance = new GoNoGoDecisionOpportunityClass();

      for (let i = 0; i < 5; i++) {
        instance.scoringCriteria.push({
          Id: i,
          Label: `Criteria ${i}`,
          ByWhom: 'User',
          ByDate: '2024-01-01',
          Comments: 'Comment',
          Score: i,
          ShowComments: true
        });
      }

      expect(instance.scoringCriteria.length).toBe(5);
    });
  });
});
