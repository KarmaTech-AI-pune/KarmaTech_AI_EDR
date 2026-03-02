using MediatR;
using System;
using System.Collections.Generic;

namespace EDR.Application.CQRS.SprintWbsPlans.Commands
{
    public class BulkCreateSprintWbsPlanCommand : IRequest<List<int>>
    {
        public List<CreateSprintWbsPlanDto> Items { get; set; } = new();
    }

    public class CreateSprintWbsPlanDto
    {
        public int TenantId { get; set; }
        public int ProjectId { get; set; }
        public int? WBSTaskId { get; set; }
        public string WBSTaskName { get; set; }
        public int? ParentWBSTaskId { get; set; }
        public Guid? AssignedUserId { get; set; }
        public string? AssignedUserName { get; set; }
        public Guid? RoleId { get; set; }
        public string? RoleName { get; set; }
        public string MonthYear { get; set; }
        public int SprintNumber { get; set; }
        public decimal PlannedHours { get; set; }
        public decimal RemainingHours { get; set; }
        public int ProgramSequence { get; set; }
        public bool IsConsumed { get; set; }
        public string? AcceptanceCriteria { get; set; }
        public string? TaskDescription { get; set; }
    }
}

