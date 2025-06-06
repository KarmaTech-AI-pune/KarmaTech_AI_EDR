export interface ProjectClosureRow {
    projectId: string;
    // Metadata fields
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string | null;
    updatedBy?: string | null;
    // Workflow fields
    workflowStatusId?: number;
    // Section A: Overall Project Delivery
    clientFeedback: string | null;
    successCriteria: string | null;
    clientExpectations: string | null;
    otherStakeholders: string | null;

    // Section B: Project Management
    // Environmental Management
    envIssues: string | null;
    envManagement: string | null;

    // Third Party Management
    thirdPartyIssues: string | null;
    thirdPartyManagement: string | null;

    // Risk Management
    riskIssues: string | null;
    riskManagement: string | null;

    // Knowledge Management
    knowledgeGoals: string | null;

    // Programme
    baselineComparison: string | null;
    delayedDeliverables: string | null;
    unforeseeableDelays: string | null;

    // Budget
    budgetEstimate: string | null;
    profitTarget: string | null;
    changeOrders: string | null;
    closeOutBudget: string | null;

    // Resources
    resourceAvailability: string | null;
    vendorFeedback: string | null;
    projectTeamFeedback: string | null;

    // Project Checks & Reviews
    designOutputs: string | null;
    projectReviewMeetings: string | null;
    clientDesignReviews: string | null;

    // Project Reporting & Control
    internalReporting: string | null;
    clientReporting: string | null;
    internalMeetings: string | null;
    clientMeetings: string | null;
    externalMeetings: string | null;

    // Project Plan
    planUpToDate: string | null;
    planUseful: string | null;

    // Hindrances
    hindrances: string | null;

    // Client Payment Performance
    clientPayment: string | null;

    // General Design Items
    // Project Brief
    briefAims: string | null;
    designReviewOutputs: string | null;

    // Constructability
    constructabilityReview: string | null;

    // Technical Content
    designReview: string | null;
    technicalRequirements: string | null;
    innovativeIdeas: string | null;
    suitableOptions: string | null;
    additionalInformation: string | null;

    // Quality
    deliverableExpectations: string | null;

    // Involvement
    stakeholderInvolvement: string | null;

    // Knowledge Goals
    knowledgeGoalsAchieved: string | null;
    technicalToolsDissemination: string | null;

    // Specialist Knowledge
    specialistKnowledgeValue: string | null;

    // Other
    otherComments: string | null;

    // Section D: Construction
    // Target Cost
    targetCostAccuracyValue: boolean;
    targetCostAccuracy: string | null;
    changeControlReviewValue: boolean;
    changeControlReview: string | null;
    compensationEventsValue: boolean;
    compensationEvents: string | null;
    expenditureProfileValue: boolean;
    expenditureProfile: string | null;

    // Health & Safety
    healthSafetyConcernsValue: boolean;
    healthSafetyConcerns: string | null;

    // Programme
    programmeRealisticValue: boolean;
    programmeRealistic: string | null;
    programmeUpdatesValue: boolean;
    programmeUpdates: string | null;

    // Quality
    requiredQualityValue: boolean;
    requiredQuality: string | null;
    operationalRequirementsValue: boolean;
    operationalRequirements: string | null;

    // Involvement
    constructionInvolvementValue: boolean;
    constructionInvolvement: string | null;
    efficienciesValue: boolean;
    efficiencies: string | null;

    // Maintenance Agreements
    maintenanceAgreementsValue: boolean;
    maintenanceAgreements: string | null;

    // As Builts and O&M Manuals
    asBuiltManualsValue: boolean;
    asBuiltManuals: string | null;
    hsFileForwardedValue: boolean;
    hsFileForwarded: string | null;

    // Additional Construction Fields
    variations: string | null;
    technoLegalIssues: string | null;
    constructionOther: string | null;

    // Additional fields for positives and lessons learned
    positives?: string | null;
    lessonsLearned?: string | null;
    planningIssues?: string | null;
    planningLessons?: string | null;
    workflowHistory?:WorkflowHistory
  }

  export interface WorkflowHistory {
      id: number;
      projectClosureId: number;
      actionDate: Date;
      comments: string;
      statusId: number;
      action: string;
      actionBy: string;
      assignedToId: string;
  }