import { axiosInstance } from './axiosConfig';
import { 
  ScoringDescription, 
  ScoreRange, 
  ScoringCriteria 
} from '../models/GoNoGoDecisionOpportunityModel';

export const goNoGoOpportunityApi = {
    

    // Fetch Scoring Criteria
    getScoringCriteria: async (): Promise<ScoringCriteria[]> => {
        try {
          const response = await axiosInstance.get('/api/GoNoGoDecisionOpportunity/GetScoringCriteria');
          
          console.log('Scoring Criteria Response:', response.data);

          // Map the response to ScoringCriteria type
          return (response.data || []).map((criteria: any): ScoringCriteria => ({
            Id: criteria.id || criteria.Id || 0,
            Label: criteria.label || criteria.Label || '',
            ByWhom: criteria.byWhom || criteria.ByWhom || '',
            ByDate: criteria.byDate || criteria.ByDate || '',
            Comments: criteria.comments || criteria.Comments || '',
            Score: criteria.score || criteria.Score || 0,
            ShowComments: criteria.showComments || criteria.ShowComments || false
          }));
        } catch (error) {
          console.error('Error fetching scoring criteria', error);
          return [];
        }
    },

    // Fetch Scoring Ranges
    getScoringRanges: async (): Promise<ScoreRange[]> => {
        try {
          const response = await axiosInstance.get('/api/GoNoGoDecisionOpportunity/GetScoringRange');
          
          console.log('Scoring Ranges Response:', response.data);

          // Map the response to ScoreRange type
          return (response.data || []).map((range: any): ScoreRange => ({
            id: range.id || range.Id || 0,
            value: range.value || range.Value || 0,
            label: range.label || range.Label || '',
            range: range.range || range.Range || 'low'
          }));
        } catch (error) {
          console.error('Error fetching scoring ranges', error);
          return [];
        }
    },

    // Fetch Scoring Descriptions
    getScoringDescriptions: async (): Promise<ScoringDescription[]> => {
        try {
          const response = await axiosInstance.get('/api/GoNoGoDecisionOpportunity/GetScoringRDescription');
          
          console.log('Scoring Descriptions Response:', response.data);

          // Map the response to ScoringDescription type
          return (response.data || []).map((desc: any): ScoringDescription => ({
            id: desc.id || desc.Id || 0,
            label: desc.label || desc.Label || '',
            high: desc.high || desc.High || '',
            medium: desc.medium || desc.Medium || '',
            low: desc.low || desc.Low || ''
          }));
        } catch (error) {
          console.error('Error fetching scoring descriptions', error);
          return [];
        }
    }
};
