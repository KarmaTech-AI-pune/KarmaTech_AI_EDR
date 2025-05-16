using System;
using MediatR;
using NJS.Application.DTOs;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.CheckReview.Commands
{
    public class CreateCheckReviewCommand : IRequest<CheckReviewDto>
    {
        public int ProjectId { get; set; }
        public string ActivityNo { get; set; }
        public string ActivityName { get; set; }
        public string DocumentNumber { get; set; }
        public string DocumentName { get; set; }
        public string Objective { get; set; }
        public string References { get; set; }
        public string FileName { get; set; }
        public string QualityIssues { get; set; }
        public string Completion { get; set; }
        public string CheckedBy { get; set; }
        public string ApprovedBy { get; set; }
        public string ActionTaken { get; set; }
        public string Maker { get; set; }
        public string Checker { get; set; }
        public string CreatedBy { get; set; }
    }
}
