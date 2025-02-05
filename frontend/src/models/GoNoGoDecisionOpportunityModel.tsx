import { OpportunityTracking } from './opportunityTrackingModel';

export interface GoNoGoDecisionOpportunityModel {
    id: number;
    typeOfBid: number; // Assuming TypeOfBid is an enum/number
    sector: string | null;
    bdHead: string | null;
    office: string | null;
    regionalBDHead: string | null;
    region: string | null;
    typeOfClient: string | null;
    enderFee: string | null;
    emd: string | null;

    opportunityId: number;
    opportunityTracking?: OpportunityTracking | null;

    scoringCriteriaId?: number | null;
    scoringCriterias?: any | null; // Replace 'any' with actual type if available

    scoreRangeId?: number | null;
    scoreRanges?: any | null; // Replace 'any' with actual type if available

    scoringDescriptionId?: number | null;
    scoringDescriptions?: any | null; // Replace 'any' with actual type if available
}
export interface ScoringCriteria 
{
    Id :number,
    Label :string,
    ByWhom :string,
    ByDate :string,
    Comments :string,
    Score :number,
    ShowComments : boolean 
}

export interface ScoreRange {
    id: number;
    value: number;
    label: string;
    range: string;
  }

export interface ScoringDescription {
    id: number;
    label: string;
    high: string;
    medium: string;
    low: string;
    
}

export class GoNoGoDecisionOpportunityClass{
    scoringCriteria: ScoringCriteria[];
    scoreRanges: ScoreRange[];
    scoringDescriptions: ScoringDescription[];

    constructor() {
        this.scoringCriteria = [];
        this.scoreRanges = [];
        this.scoringDescriptions = [];
    }
}


