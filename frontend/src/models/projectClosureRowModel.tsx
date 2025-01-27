export interface ProjectClosureRow {
    projectId: string;
    // Section A: Overall Project Delivery
    clientFeedback: string;
    successCriteria: string;
    clientExpectations: string;
    otherStakeholders: string;
  
    // Section B: Project Management
    // Environmental Management
    envIssues: string;
    envManagement: string;
  
    // Third Party Management
    thirdPartyIssues: string;
    thirdPartyManagement: string;
  
    // Risk Management
    riskIssues: string;
    riskManagement: string;
  
    // Knowledge Management
    knowledgeGoals: string;
  
    // Programme
    baselineComparison: string;
    delayedDeliverables: string;
    unforeseeableDelays: string;
  
    // Budget
    budgetEstimate: string;
    profitTarget: string;
    changeOrders: string;
    closeOutBudget: string;
  
    // Resources
    resourceAvailability: string;
    vendorFeedback: string;
    projectTeamFeedback: string;
  
    // Project Checks & Reviews
    designOutputs: string;
    projectReviewMeetings: string;
    clientDesignReviews: string;
  
    // Project Reporting & Control
    internalReporting: string;
    clientReporting: string;
    internalMeetings: string;
    clientMeetings: string;
    externalMeetings: string;
  
    // Project Plan
    planUpToDate: string;
    planUseful: string;
  
    // Hindrances
    hindrances: string;
  
    // Client Payment Performance
    clientPayment: string;
  
    // General Design Items
    // Project Brief
    briefAims: string;
    designReviewOutputs: string;
  
    // Constructability
    constructabilityReview: string;
  
    // Technical Content
    designReview: string;
    technicalRequirements: string;
    innovativeIdeas: string;
    suitableOptions: string;
    additionalInformation: string;
  
    // Quality
    deliverableExpectations: string;
  
    // Involvement
    stakeholderInvolvement: string;
  
    // Knowledge Goals
    knowledgeGoalsAchieved: string;
    technicalToolsDissemination: string;
  
    // Specialist Knowledge
    specialistKnowledgeValue: string;
  
    // Other
    otherComments: string;
  
    // Section D: Construction
    // Target Cost
    targetCostAccuracyValue: boolean;
    targetCostAccuracy: string;
    changeControlReviewValue: boolean;
    changeControlReview: string;
    compensationEventsValue: boolean;
    compensationEvents: string;
    expenditureProfileValue: boolean;
    expenditureProfile: string;
  
    // Health & Safety
    healthSafetyConcernsValue: boolean;
    healthSafetyConcerns: string;
  
    // Programme
    programmeRealisticValue: boolean;
    programmeRealistic: string;
    programmeUpdatesValue: boolean;
    programmeUpdates: string;
  
    // Quality
    requiredQualityValue: boolean;
    requiredQuality: string;
    operationalRequirementsValue: boolean;
    operationalRequirements: string;
  
    // Involvement
    constructionInvolvementValue: boolean;
    constructionInvolvement: string;
    efficienciesValue: boolean;
    efficiencies: string;
  
    // Maintenance Agreements
    maintenanceAgreementsValue: boolean;
    maintenanceAgreements: string;
  
    // As Builts and O&M Manuals
    asBuiltManualsValue: boolean;
    asBuiltManuals: string;
    hsFileForwardedValue: boolean;
    hsFileForwarded: string;
  
    // Additional Construction Fields
    variations: string;
    technoLegalIssues: string;
    constructionOther: string;
  }