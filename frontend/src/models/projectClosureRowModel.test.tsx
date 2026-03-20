import { describe, it, expect } from 'vitest';
import { ProjectClosureRow, WorkflowHistory } from './projectClosureRowModel';

describe('ProjectClosureRowModel', () => {
  describe('ProjectClosureRow Interface', () => {
    it('should create a valid ProjectClosureRow with required fields', () => {
      const projectClosure: ProjectClosureRow = {
        projectId: 'proj-123',
        clientFeedback: 'Excellent work',
        successCriteria: 'All deliverables met',
        clientExpectations: 'Exceeded expectations',
        otherStakeholders: 'Satisfied',
        envIssues: null,
        envManagement: null,
        thirdPartyIssues: null,
        thirdPartyManagement: null,
        riskIssues: null,
        riskManagement: null,
        knowledgeGoals: null,
        baselineComparison: null,
        delayedDeliverables: null,
        unforeseeableDelays: null,
        budgetEstimate: null,
        profitTarget: null,
        changeOrders: null,
        closeOutBudget: null,
        resourceAvailability: null,
        vendorFeedback: null,
        projectTeamFeedback: null,
        designOutputs: null,
        projectReviewMeetings: null,
        clientDesignReviews: null,
        internalReporting: null,
        clientReporting: null,
        internalMeetings: null,
        clientMeetings: null,
        externalMeetings: null,
        planUpToDate: null,
        planUseful: null,
        hindrances: null,
        clientPayment: null,
        briefAims: null,
        designReviewOutputs: null,
        constructabilityReview: null,
        designReview: null,
        technicalRequirements: null,
        innovativeIdeas: null,
        suitableOptions: null,
        additionalInformation: null,
        deliverableExpectations: null,
        stakeholderInvolvement: null,
        knowledgeGoalsAchieved: null,
        technicalToolsDissemination: null,
        specialistKnowledgeValue: null,
        otherComments: null,
        targetCostAccuracyValue: false,
        targetCostAccuracy: null,
        changeControlReviewValue: false,
        changeControlReview: null,
        compensationEventsValue: false,
        compensationEvents: null,
        expenditureProfileValue: false,
        expenditureProfile: null,
        healthSafetyConcernsValue: false,
        healthSafetyConcerns: null,
        programmeRealisticValue: false,
        programmeRealistic: null,
        programmeUpdatesValue: false,
        programmeUpdates: null,
        requiredQualityValue: false,
        requiredQuality: null,
        operationalRequirementsValue: false,
        operationalRequirements: null,
        constructionInvolvementValue: false,
        constructionInvolvement: null,
        efficienciesValue: false,
        efficiencies: null,
        maintenanceAgreementsValue: false,
        maintenanceAgreements: null,
        asBuiltManualsValue: false,
        asBuiltManuals: null,
        hsFileForwardedValue: false,
        hsFileForwarded: null,
        variations: null,
        technoLegalIssues: null,
        constructionOther: null
      };

      expect(projectClosure.projectId).toBe('proj-123');
      expect(projectClosure.clientFeedback).toBe('Excellent work');
      expect(projectClosure.successCriteria).toBe('All deliverables met');
      expect(projectClosure.targetCostAccuracyValue).toBe(false);
    });

    it('should handle optional metadata fields', () => {
      const projectClosure: ProjectClosureRow = {
        projectId: 'proj-456',
        createdAt: '2024-01-15T10:30:00Z',
        createdBy: 'user123',
        updatedAt: '2024-01-16T14:20:00Z',
        updatedBy: 'user456',
        workflowStatusId: 1,
        clientFeedback: null,
        successCriteria: null,
        clientExpectations: null,
        otherStakeholders: null,
        envIssues: null,
        envManagement: null,
        thirdPartyIssues: null,
        thirdPartyManagement: null,
        riskIssues: null,
        riskManagement: null,
        knowledgeGoals: null,
        baselineComparison: null,
        delayedDeliverables: null,
        unforeseeableDelays: null,
        budgetEstimate: null,
        profitTarget: null,
        changeOrders: null,
        closeOutBudget: null,
        resourceAvailability: null,
        vendorFeedback: null,
        projectTeamFeedback: null,
        designOutputs: null,
        projectReviewMeetings: null,
        clientDesignReviews: null,
        internalReporting: null,
        clientReporting: null,
        internalMeetings: null,
        clientMeetings: null,
        externalMeetings: null,
        planUpToDate: null,
        planUseful: null,
        hindrances: null,
        clientPayment: null,
        briefAims: null,
        designReviewOutputs: null,
        constructabilityReview: null,
        designReview: null,
        technicalRequirements: null,
        innovativeIdeas: null,
        suitableOptions: null,
        additionalInformation: null,
        deliverableExpectations: null,
        stakeholderInvolvement: null,
        knowledgeGoalsAchieved: null,
        technicalToolsDissemination: null,
        specialistKnowledgeValue: null,
        otherComments: null,
        targetCostAccuracyValue: true,
        targetCostAccuracy: 'Within 5% of budget',
        changeControlReviewValue: true,
        changeControlReview: 'Properly managed',
        compensationEventsValue: false,
        compensationEvents: null,
        expenditureProfileValue: true,
        expenditureProfile: 'As planned',
        healthSafetyConcernsValue: false,
        healthSafetyConcerns: null,
        programmeRealisticValue: true,
        programmeRealistic: 'Achievable timeline',
        programmeUpdatesValue: true,
        programmeUpdates: 'Regular updates provided',
        requiredQualityValue: true,
        requiredQuality: 'Met all standards',
        operationalRequirementsValue: true,
        operationalRequirements: 'Fully satisfied',
        constructionInvolvementValue: true,
        constructionInvolvement: 'Active participation',
        efficienciesValue: true,
        efficiencies: 'Improved processes',
        maintenanceAgreementsValue: true,
        maintenanceAgreements: 'Agreements in place',
        asBuiltManualsValue: true,
        asBuiltManuals: 'Complete documentation',
        hsFileForwardedValue: true,
        hsFileForwarded: 'Files transferred',
        variations: 'Minor changes only',
        technoLegalIssues: 'No issues',
        constructionOther: 'Smooth execution'
      };

      expect(projectClosure.createdAt).toBe('2024-01-15T10:30:00Z');
      expect(projectClosure.createdBy).toBe('user123');
      expect(projectClosure.updatedAt).toBe('2024-01-16T14:20:00Z');
      expect(projectClosure.updatedBy).toBe('user456');
      expect(projectClosure.workflowStatusId).toBe(1);
      expect(projectClosure.targetCostAccuracyValue).toBe(true);
      expect(projectClosure.targetCostAccuracy).toBe('Within 5% of budget');
    });

    it('should handle additional optional fields', () => {
      const projectClosure: ProjectClosureRow = {
        projectId: 'proj-789',
        positives: 'Great team collaboration',
        lessonsLearned: 'Better communication needed',
        planningIssues: 'Initial scope unclear',
        planningLessons: 'More detailed planning required',
        clientFeedback: null,
        successCriteria: null,
        clientExpectations: null,
        otherStakeholders: null,
        envIssues: null,
        envManagement: null,
        thirdPartyIssues: null,
        thirdPartyManagement: null,
        riskIssues: null,
        riskManagement: null,
        knowledgeGoals: null,
        baselineComparison: null,
        delayedDeliverables: null,
        unforeseeableDelays: null,
        budgetEstimate: null,
        profitTarget: null,
        changeOrders: null,
        closeOutBudget: null,
        resourceAvailability: null,
        vendorFeedback: null,
        projectTeamFeedback: null,
        designOutputs: null,
        projectReviewMeetings: null,
        clientDesignReviews: null,
        internalReporting: null,
        clientReporting: null,
        internalMeetings: null,
        clientMeetings: null,
        externalMeetings: null,
        planUpToDate: null,
        planUseful: null,
        hindrances: null,
        clientPayment: null,
        briefAims: null,
        designReviewOutputs: null,
        constructabilityReview: null,
        designReview: null,
        technicalRequirements: null,
        innovativeIdeas: null,
        suitableOptions: null,
        additionalInformation: null,
        deliverableExpectations: null,
        stakeholderInvolvement: null,
        knowledgeGoalsAchieved: null,
        technicalToolsDissemination: null,
        specialistKnowledgeValue: null,
        otherComments: null,
        targetCostAccuracyValue: false,
        targetCostAccuracy: null,
        changeControlReviewValue: false,
        changeControlReview: null,
        compensationEventsValue: false,
        compensationEvents: null,
        expenditureProfileValue: false,
        expenditureProfile: null,
        healthSafetyConcernsValue: false,
        healthSafetyConcerns: null,
        programmeRealisticValue: false,
        programmeRealistic: null,
        programmeUpdatesValue: false,
        programmeUpdates: null,
        requiredQualityValue: false,
        requiredQuality: null,
        operationalRequirementsValue: false,
        operationalRequirements: null,
        constructionInvolvementValue: false,
        constructionInvolvement: null,
        efficienciesValue: false,
        efficiencies: null,
        maintenanceAgreementsValue: false,
        maintenanceAgreements: null,
        asBuiltManualsValue: false,
        asBuiltManuals: null,
        hsFileForwardedValue: false,
        hsFileForwarded: null,
        variations: null,
        technoLegalIssues: null,
        constructionOther: null
      };

      expect(projectClosure.positives).toBe('Great team collaboration');
      expect(projectClosure.lessonsLearned).toBe('Better communication needed');
      expect(projectClosure.planningIssues).toBe('Initial scope unclear');
      expect(projectClosure.planningLessons).toBe('More detailed planning required');
    });

    it('should handle workflow history', () => {
      const workflowHistory: WorkflowHistory = {
        id: 1,
        projectClosureId: 123,
        actionDate: new Date('2024-01-15T10:30:00Z'),
        comments: 'Initial submission',
        statusId: 1,
        action: 'SUBMIT',
        actionBy: 'user123',
        assignedToId: 'user456'
      };

      const projectClosure: ProjectClosureRow = {
        projectId: 'proj-999',
        workflowHistory: workflowHistory,
        clientFeedback: null,
        successCriteria: null,
        clientExpectations: null,
        otherStakeholders: null,
        envIssues: null,
        envManagement: null,
        thirdPartyIssues: null,
        thirdPartyManagement: null,
        riskIssues: null,
        riskManagement: null,
        knowledgeGoals: null,
        baselineComparison: null,
        delayedDeliverables: null,
        unforeseeableDelays: null,
        budgetEstimate: null,
        profitTarget: null,
        changeOrders: null,
        closeOutBudget: null,
        resourceAvailability: null,
        vendorFeedback: null,
        projectTeamFeedback: null,
        designOutputs: null,
        projectReviewMeetings: null,
        clientDesignReviews: null,
        internalReporting: null,
        clientReporting: null,
        internalMeetings: null,
        clientMeetings: null,
        externalMeetings: null,
        planUpToDate: null,
        planUseful: null,
        hindrances: null,
        clientPayment: null,
        briefAims: null,
        designReviewOutputs: null,
        constructabilityReview: null,
        designReview: null,
        technicalRequirements: null,
        innovativeIdeas: null,
        suitableOptions: null,
        additionalInformation: null,
        deliverableExpectations: null,
        stakeholderInvolvement: null,
        knowledgeGoalsAchieved: null,
        technicalToolsDissemination: null,
        specialistKnowledgeValue: null,
        otherComments: null,
        targetCostAccuracyValue: false,
        targetCostAccuracy: null,
        changeControlReviewValue: false,
        changeControlReview: null,
        compensationEventsValue: false,
        compensationEvents: null,
        expenditureProfileValue: false,
        expenditureProfile: null,
        healthSafetyConcernsValue: false,
        healthSafetyConcerns: null,
        programmeRealisticValue: false,
        programmeRealistic: null,
        programmeUpdatesValue: false,
        programmeUpdates: null,
        requiredQualityValue: false,
        requiredQuality: null,
        operationalRequirementsValue: false,
        operationalRequirements: null,
        constructionInvolvementValue: false,
        constructionInvolvement: null,
        efficienciesValue: false,
        efficiencies: null,
        maintenanceAgreementsValue: false,
        maintenanceAgreements: null,
        asBuiltManualsValue: false,
        asBuiltManuals: null,
        hsFileForwardedValue: false,
        hsFileForwarded: null,
        variations: null,
        technoLegalIssues: null,
        constructionOther: null
      };

      expect(projectClosure.workflowHistory).toBeDefined();
      expect(projectClosure.workflowHistory?.id).toBe(1);
      expect(projectClosure.workflowHistory?.projectClosureId).toBe(123);
      expect(projectClosure.workflowHistory?.comments).toBe('Initial submission');
      expect(projectClosure.workflowHistory?.action).toBe('SUBMIT');
      expect(projectClosure.workflowHistory?.actionBy).toBe('user123');
      expect(projectClosure.workflowHistory?.assignedToId).toBe('user456');
    });
  });

  describe('WorkflowHistory Interface', () => {
    it('should create a valid WorkflowHistory object', () => {
      const workflowHistory: WorkflowHistory = {
        id: 2,
        projectClosureId: 456,
        actionDate: new Date('2024-01-20T15:45:00Z'),
        comments: 'Approved by manager',
        statusId: 2,
        action: 'APPROVE',
        actionBy: 'manager123',
        assignedToId: 'reviewer456'
      };

      expect(workflowHistory.id).toBe(2);
      expect(workflowHistory.projectClosureId).toBe(456);
      expect(workflowHistory.actionDate).toBeInstanceOf(Date);
      expect(workflowHistory.comments).toBe('Approved by manager');
      expect(workflowHistory.statusId).toBe(2);
      expect(workflowHistory.action).toBe('APPROVE');
      expect(workflowHistory.actionBy).toBe('manager123');
      expect(workflowHistory.assignedToId).toBe('reviewer456');
    });

    it('should handle different workflow actions', () => {
      const actions = ['SUBMIT', 'APPROVE', 'REJECT', 'REVIEW', 'COMPLETE'];
      
      actions.forEach((action, index) => {
        const workflowHistory: WorkflowHistory = {
          id: index + 1,
          projectClosureId: 100 + index,
          actionDate: new Date(),
          comments: `Action: ${action}`,
          statusId: index + 1,
          action: action,
          actionBy: `user${index}`,
          assignedToId: `assignee${index}`
        };

        expect(workflowHistory.action).toBe(action);
        expect(workflowHistory.comments).toBe(`Action: ${action}`);
      });
    });
  });

  describe('Type Safety', () => {
    it('should enforce string or null types for text fields', () => {
      const projectClosure: ProjectClosureRow = {
        projectId: 'proj-type-test',
        clientFeedback: 'Valid string',
        successCriteria: null,
        clientExpectations: 'Another valid string',
        otherStakeholders: null,
        envIssues: null,
        envManagement: null,
        thirdPartyIssues: null,
        thirdPartyManagement: null,
        riskIssues: null,
        riskManagement: null,
        knowledgeGoals: null,
        baselineComparison: null,
        delayedDeliverables: null,
        unforeseeableDelays: null,
        budgetEstimate: null,
        profitTarget: null,
        changeOrders: null,
        closeOutBudget: null,
        resourceAvailability: null,
        vendorFeedback: null,
        projectTeamFeedback: null,
        designOutputs: null,
        projectReviewMeetings: null,
        clientDesignReviews: null,
        internalReporting: null,
        clientReporting: null,
        internalMeetings: null,
        clientMeetings: null,
        externalMeetings: null,
        planUpToDate: null,
        planUseful: null,
        hindrances: null,
        clientPayment: null,
        briefAims: null,
        designReviewOutputs: null,
        constructabilityReview: null,
        designReview: null,
        technicalRequirements: null,
        innovativeIdeas: null,
        suitableOptions: null,
        additionalInformation: null,
        deliverableExpectations: null,
        stakeholderInvolvement: null,
        knowledgeGoalsAchieved: null,
        technicalToolsDissemination: null,
        specialistKnowledgeValue: null,
        otherComments: null,
        targetCostAccuracyValue: true,
        targetCostAccuracy: 'Valid accuracy description',
        changeControlReviewValue: false,
        changeControlReview: null,
        compensationEventsValue: true,
        compensationEvents: 'Valid compensation description',
        expenditureProfileValue: false,
        expenditureProfile: null,
        healthSafetyConcernsValue: false,
        healthSafetyConcerns: null,
        programmeRealisticValue: false,
        programmeRealistic: null,
        programmeUpdatesValue: false,
        programmeUpdates: null,
        requiredQualityValue: false,
        requiredQuality: null,
        operationalRequirementsValue: false,
        operationalRequirements: null,
        constructionInvolvementValue: false,
        constructionInvolvement: null,
        efficienciesValue: false,
        efficiencies: null,
        maintenanceAgreementsValue: false,
        maintenanceAgreements: null,
        asBuiltManualsValue: false,
        asBuiltManuals: null,
        hsFileForwardedValue: false,
        hsFileForwarded: null,
        variations: null,
        technoLegalIssues: null,
        constructionOther: null
      };

      expect(typeof projectClosure.clientFeedback).toBe('string');
      expect(projectClosure.successCriteria).toBeNull();
      expect(typeof projectClosure.clientExpectations).toBe('string');
      expect(projectClosure.otherStakeholders).toBeNull();
      expect(typeof projectClosure.targetCostAccuracyValue).toBe('boolean');
      expect(typeof projectClosure.targetCostAccuracy).toBe('string');
    });

    it('should enforce boolean types for value fields', () => {
      const projectClosure: ProjectClosureRow = {
        projectId: 'proj-boolean-test',
        clientFeedback: null,
        successCriteria: null,
        clientExpectations: null,
        otherStakeholders: null,
        envIssues: null,
        envManagement: null,
        thirdPartyIssues: null,
        thirdPartyManagement: null,
        riskIssues: null,
        riskManagement: null,
        knowledgeGoals: null,
        baselineComparison: null,
        delayedDeliverables: null,
        unforeseeableDelays: null,
        budgetEstimate: null,
        profitTarget: null,
        changeOrders: null,
        closeOutBudget: null,
        resourceAvailability: null,
        vendorFeedback: null,
        projectTeamFeedback: null,
        designOutputs: null,
        projectReviewMeetings: null,
        clientDesignReviews: null,
        internalReporting: null,
        clientReporting: null,
        internalMeetings: null,
        clientMeetings: null,
        externalMeetings: null,
        planUpToDate: null,
        planUseful: null,
        hindrances: null,
        clientPayment: null,
        briefAims: null,
        designReviewOutputs: null,
        constructabilityReview: null,
        designReview: null,
        technicalRequirements: null,
        innovativeIdeas: null,
        suitableOptions: null,
        additionalInformation: null,
        deliverableExpectations: null,
        stakeholderInvolvement: null,
        knowledgeGoalsAchieved: null,
        technicalToolsDissemination: null,
        specialistKnowledgeValue: null,
        otherComments: null,
        targetCostAccuracyValue: true,
        targetCostAccuracy: null,
        changeControlReviewValue: false,
        changeControlReview: null,
        compensationEventsValue: true,
        compensationEvents: null,
        expenditureProfileValue: false,
        expenditureProfile: null,
        healthSafetyConcernsValue: true,
        healthSafetyConcerns: null,
        programmeRealisticValue: false,
        programmeRealistic: null,
        programmeUpdatesValue: true,
        programmeUpdates: null,
        requiredQualityValue: false,
        requiredQuality: null,
        operationalRequirementsValue: true,
        operationalRequirements: null,
        constructionInvolvementValue: false,
        constructionInvolvement: null,
        efficienciesValue: true,
        efficiencies: null,
        maintenanceAgreementsValue: false,
        maintenanceAgreements: null,
        asBuiltManualsValue: true,
        asBuiltManuals: null,
        hsFileForwardedValue: false,
        hsFileForwarded: null,
        variations: null,
        technoLegalIssues: null,
        constructionOther: null
      };

      expect(typeof projectClosure.targetCostAccuracyValue).toBe('boolean');
      expect(typeof projectClosure.changeControlReviewValue).toBe('boolean');
      expect(typeof projectClosure.compensationEventsValue).toBe('boolean');
      expect(typeof projectClosure.expenditureProfileValue).toBe('boolean');
      expect(typeof projectClosure.healthSafetyConcernsValue).toBe('boolean');
      expect(typeof projectClosure.programmeRealisticValue).toBe('boolean');
      expect(typeof projectClosure.programmeUpdatesValue).toBe('boolean');
      expect(typeof projectClosure.requiredQualityValue).toBe('boolean');
      expect(typeof projectClosure.operationalRequirementsValue).toBe('boolean');
      expect(typeof projectClosure.constructionInvolvementValue).toBe('boolean');
      expect(typeof projectClosure.efficienciesValue).toBe('boolean');
      expect(typeof projectClosure.maintenanceAgreementsValue).toBe('boolean');
      expect(typeof projectClosure.asBuiltManualsValue).toBe('boolean');
      expect(typeof projectClosure.hsFileForwardedValue).toBe('boolean');
    });
  });
});