using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("ProjectClosures")]
    public class ProjectClosure
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; }

        // Section A: Overall Project Delivery
        public string ClientFeedback { get; set; }
        public string SuccessCriteria { get; set; }
        public string ClientExpectations { get; set; }
        public string OtherStakeholders { get; set; }

        // Section B: Project Management
        // Environmental Management
        public string EnvIssues { get; set; }
        public string EnvManagement { get; set; }

        // Third Party Management
        public string ThirdPartyIssues { get; set; }
        public string ThirdPartyManagement { get; set; }

        // Risk Management
        public string RiskIssues { get; set; }
        public string RiskManagement { get; set; }

        // Knowledge Management
        public string KnowledgeGoals { get; set; }

        // Programme
        public string BaselineComparison { get; set; }
        public string DelayedDeliverables { get; set; }
        public string UnforeseeableDelays { get; set; }

        // Budget
        public string BudgetEstimate { get; set; }
        public string ProfitTarget { get; set; }
        public string ChangeOrders { get; set; }
        public string CloseOutBudget { get; set; }

        // Resources
        public string ResourceAvailability { get; set; }
        public string VendorFeedback { get; set; }
        public string ProjectTeamFeedback { get; set; }

        // Section C: Technical Delivery
        // Design
        public string DesignOutputs { get; set; }
        public string ProjectReviewMeetings { get; set; }
        public string ClientDesignReviews { get; set; }

        // Reporting
        public string InternalReporting { get; set; }
        public string ClientReporting { get; set; }

        // Meetings
        public string InternalMeetings { get; set; }
        public string ClientMeetings { get; set; }
        public string ExternalMeetings { get; set; }

        // Planning
        public string PlanUpToDate { get; set; }
        public string PlanUseful { get; set; }
        public string Hindrances { get; set; }
        public string ClientPayment { get; set; }
        public string PlanningIssues { get; set; }
        public string PlanningLessons { get; set; }

        // Technical Content
        public string BriefAims { get; set; }
        public string DesignReviewOutputs { get; set; }
        public string ConstructabilityReview { get; set; }
        public string DesignReview { get; set; }
        public string TechnicalRequirements { get; set; }
        public string InnovativeIdeas { get; set; }
        public string SuitableOptions { get; set; }
        public string AdditionalInformation { get; set; }

        // Quality
        public string DeliverableExpectations { get; set; }

        // Involvement
        public string StakeholderInvolvement { get; set; }

        // Knowledge Goals
        public string KnowledgeGoalsAchieved { get; set; }
        public string TechnicalToolsDissemination { get; set; }

        // Specialist Knowledge
        public string SpecialistKnowledgeValue { get; set; }

        // Other
        public string OtherComments { get; set; }

        // Section D: Construction
        // Target Cost
        public bool? TargetCostAccuracyValue { get; set; }
        public string TargetCostAccuracy { get; set; }
        public bool? ChangeControlReviewValue { get; set; }
        public string ChangeControlReview { get; set; }
        public bool? CompensationEventsValue { get; set; }
        public string CompensationEvents { get; set; }
        public bool? ExpenditureProfileValue { get; set; }
        public string ExpenditureProfile { get; set; }

        // Health & Safety
        public bool? HealthSafetyConcernsValue { get; set; }
        public string HealthSafetyConcerns { get; set; }

        // Programme
        public bool? ProgrammeRealisticValue { get; set; }
        public string ProgrammeRealistic { get; set; }
        public bool? ProgrammeUpdatesValue { get; set; }
        public string ProgrammeUpdates { get; set; }

        // Quality
        public bool? RequiredQualityValue { get; set; }
        public string RequiredQuality { get; set; }

        // Operational Requirements
        public bool? OperationalRequirementsValue { get; set; }
        public string OperationalRequirements { get; set; }

        // Involvement
        public bool? ConstructionInvolvementValue { get; set; }
        public string ConstructionInvolvement { get; set; }
        public bool? EfficienciesValue { get; set; }
        public string Efficiencies { get; set; }

        // Maintenance Agreements
        public bool? MaintenanceAgreementsValue { get; set; }
        public string MaintenanceAgreements { get; set; }

        // As Builts and O&M Manuals
        public bool? AsBuiltManualsValue { get; set; }
        public string AsBuiltManuals { get; set; }
        public bool? HsFileForwardedValue { get; set; }
        public string HsFileForwarded { get; set; }

        // Additional Construction Fields
        public string Variations { get; set; }
        public string TechnoLegalIssues { get; set; }
        public string ConstructionOther { get; set; }

        // Section E: Overall
        // These fields store JSON arrays of strings for multiple entries
        public string Positives { get; set; }
        public string LessonsLearned { get; set; }

        // Removed workflow fields

        // Workflow status
        public int WorkflowStatusId { get; set; } = 1; // Default to Initial

        [ForeignKey("WorkflowStatusId")]
        public PMWorkflowStatus WorkflowStatus { get; set; }

        // Navigation property for workflow history
        public ICollection<ProjectClosureWorkflowHistory> WorkflowHistories { get; set; } = new List<ProjectClosureWorkflowHistory>();

        // Audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = "System";
        public DateTime? UpdatedAt { get; set; }
        public string UpdatedBy { get; set; }

        // Navigation property for comments - removed to fix build issues
        // public virtual ICollection<ProjectClosureComment> Comments { get; set; } = new List<ProjectClosureComment>();
    }
}
