import { ProjectClosureComment } from "../../models/projectClosureCommentModel";
import { ProjectClosureRow } from "../../models/projectClosureRowModel";
export const projectClosureLabels = {
  // Section A
  clientFeedback: "What client feedback / performance certificate has been obtained ? – summarise",
  successCriteria: "Was the client project success criteria achieved ?",
  clientExpectations: "How well did the project meet (or exceed) the client's expectations ?",
  otherStakeholders: "Other Stakeholders ?",

  // Section B
  envIssues: "Were there any environmental issues not identified at Pursuit/Planning ?",
  envManagement: "How effectively were environmental issues managed ?",
  thirdPartyIssues: "Were there any third party interfaces not identified at Pursuit/Planning ?",
  thirdPartyManagement: "How effectively were third party interfaces managed ?",
  riskIssues: "Were there any risks not identified at Pursuit/Planning ?",
  riskManagement: "How effectively were risks managed ?",
  knowledgeGoals: "Were Knowledge Goals set at Pursuit/Planning achieved ?",
  baselineComparison: "How realistic was the original baseline programme compared with actual progress ?",
  delayedDeliverables: "Were any deliverables submitted late and if so, why ?",
  unforeseeableDelays: "What unforeseen delays were incurred (if any) and could these have been foreseen/avoided with hindsight ?",

  // Budget
  budgetEstimate: "How realistic was our original budget estimate compared with actual costs ?",
  profitTarget: "Did the project meet the profit target ?",
  changeOrders: "Are there any outstanding change orders/claims ?",
  closeOutBudget: "What allowance was provided for in the budget for project Close-Out activities ? Has this amount been sufficient ?",

  // Resources
  resourceAvailability: "Were sufficient resources available for the project?",
  vendorFeedback: "Has feedback on vendor performance been added to the Vendor Database",
  projectTeamFeedback: "Has feedback been provided by the Project Manager to the project team and visa versa",

  // Project Checks & Reviews
  designOutputs: "Were all design outputs checked and reviewed ?",
  projectReviewMeetings: "Were Project Review Meetings carried out ? How effective were these meetings considered ?",
  clientDesignReviews: "Were Client Design Review Meetings carried out? How effective were these meetings considered?",

  // Project Reporting & Control
  internalReporting: "How effective were internal reporting arrangements?",
  clientReporting: "How effective were client reporting arrangements?",
  internalMeetings: "How effective were internal meetings ? Were they considered frequent enough ?",
  clientMeetings: "How effective were client meetings ? Were they considered frequent enough ?",
  externalMeetings: "How effective were external meetings (Vendors / Contractor etc) ? Were they considered frequent enough ?",

  // Project Plan
  planUpToDate: "Has the Project Plan been kept up-to-date ?",
  planUseful: "Has the Project Plan considered useful by the project team ?",

  // Hindrances
  hindrances: "Hindrances",

  // Client Payment Performance
  clientPayment: "Client Payment Performance",

  // General Design Items
  // Project Brief
  briefAims: "How well did the project brief set out the aims of the project. Was sufficient detail provided ?",
  designReviewOutputs: "Have outputs from the Engineering Design Review been implemented and specialist knowledge applied to the design process as agreed ?",

  // Constructability
  constructabilityReview: "Has 'constructability' been reviewed with the Client ? Feedback to design team, lessons learned, dissemination of lessons learned etc.",

  // Technical Content
  designReview: "Review the original design against 'As Built' drawings and O&Ms, identify discontinuities, investigate and draw up lessons learnt",
  technicalRequirements: "Has the design fulfilled the project technical requirements?",
  innovativeIdeas: "Were any innovative ideas identified and applied? If so, what and have these been briefed to others?",
  suitableOptions: "Were all suitable options identified?",
  additionalInformation: "Did Project review require additional information? Should this information have been included in the original draft?",

  // Quality
  deliverableExpectations: "Did the consultant's deliverables meet the client's expectations?",

  // Involvement
  stakeholderInvolvement: "Was there effective involvement of the client / consultant / contractor as required throughout the feasibility / design?",

  // Knowledge Goals
  knowledgeGoalsAchieved: "Have knowledge goals set for the project been achieved ? Look for innovative designs included in 'special designs' or reported to all",
  technicalToolsDissemination: "Look for evidence dessimination of technical tools to all offices",

  // Specialist Knowledge
  specialistKnowledgeValue: "Was specialist Knowledge from previous projects of value to the project ?",

  // Other
  otherComments: "Other ?",

  // Section D: Construction
  targetCostAccuracy: "Did the Target Cost accurately reflect the actual outturn cost ? If applicable.",
  changeControlReview: "Review change control log, claims and variations.",
  compensationEvents: "Could compensation events have been foreseen/avoided ?",
  expenditureProfile: "Was the expenditure profile and revised expected out-turn costs updated regularly to reflect compensation events ?",
  
  healthSafetyConcerns: "Were Health & Safety concerns adequately addressed throughout the construction period ?",
  
  programmeRealistic: "Was the original programme realistic? If not, could the delays have been foreseen/avoided?",
  programmeUpdates: "Was the programme updated regularly to reflect actual progress/delay ?",
  
  requiredQuality: "Were the works to the required quality ?",
  operationalRequirements: "Do the works meet operational requirements ?",
  
  constructionInvolvement: "Was there effective involvement of the client/consultant/contractor as required throughout the construction period ?",
  efficiencies: "Were efficiencies made ? If so, what, and have these been briefed to others ?",
  
  maintenanceAgreements: "Are all NJS maintenance agreements with client in place and effective ? Look for sufficient resources.",
  
  asBuiltManuals: "Have 'as builts' and O&M Manuals (where required) been produced ? Look for evidence of review of as builts against initial design.",
  hsFileForwarded: "Has H&S File (where appropriate) been forwarded to client (Under cover of Document Transmittal) ?",

  // Additional Construction Fields
  variations: "Variations",
  technoLegalIssues: "Techno-legal issues",
  constructionOther: "Other ?",

  // Section E: Overall
  positives: "What worked well ? - List positives below and where appropriate identify actions to disseminate this information to other offices",
  lessonsLearned: "What lessons have been learnt which could be applied positively to future projects ? - List lessons-learnt below and where appropriate identify actions to disseminate this information to other offices"
}

export const dummyProjectClosures: ProjectClosureRow[] = [];
export const dummyProjectClosureComments: ProjectClosureComment[] = [];
