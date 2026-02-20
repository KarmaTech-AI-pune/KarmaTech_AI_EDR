using MediatR;
using EDR.Application.DTOs;
using System;
using System.ComponentModel.DataAnnotations;

namespace EDR.Application.CQRS.CheckReview.Commands
{
    public class UpdateCheckReviewCommand : IRequest<CheckReviewDto>
    {
        [Required]
        public int Id { get; set; }

        public int ProjectId { get; set; }

        [StringLength(50)]
        public string ActivityNo { get; set; }

        [StringLength(255)]
        public string ActivityName { get; set; }

        [StringLength(255)]
        public string DocumentNumber { get; set; }

        [StringLength(255)]
        public string DocumentName { get; set; }

        [StringLength(500)]
        public string Objective { get; set; }

        [StringLength(500)]
        public string References { get; set; }

        [StringLength(255)]
        public string FileName { get; set; }

        [StringLength(500)]
        public string QualityIssues { get; set; }

        [StringLength(1)]
        public string Completion { get; set; }

        [StringLength(255)]
        public string CheckedBy { get; set; }

        [StringLength(255)]
        public string ApprovedBy { get; set; }

        [StringLength(500)]
        public string ActionTaken { get; set; }

        [StringLength(255)]
        public string Maker { get; set; }

        [StringLength(255)]
        public string Checker { get; set; }

        // This will be set by the controller
        public string UpdatedBy { get; set; }
    }
}

