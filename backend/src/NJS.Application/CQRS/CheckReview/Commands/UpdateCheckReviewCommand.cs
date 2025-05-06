using MediatR;
using NJS.Application.Dtos;
using System;
using System.ComponentModel.DataAnnotations;

namespace NJS.Application.CQRS.CheckReview.Commands
{
    public class UpdateCheckReviewCommand : IRequest<CheckReviewDto>
    {
        [Required]
        public int Id { get; set; }
        
        [Required]
        public int ProjectId { get; set; }
        
        [Required]
        [StringLength(50)]
        public string ActivityNo { get; set; }
        
        [Required]
        [StringLength(255)]
        public string ActivityName { get; set; }
        
        [Required]
        [StringLength(500)]
        public string Objective { get; set; }
        
        [StringLength(500)]
        public string References { get; set; }
        
        [StringLength(255)]
        public string FileName { get; set; }
        
        [StringLength(500)]
        public string QualityIssues { get; set; }
        
        [Required]
        [StringLength(1)]
        public string Completion { get; set; }
        
        [StringLength(255)]
        public string CheckedBy { get; set; }
        
        [StringLength(255)]
        public string ApprovedBy { get; set; }
        
        [StringLength(500)]
        public string ActionTaken { get; set; }
        
        // This will be set by the controller
        public string UpdatedBy { get; set; }
    }
}
