using System;

namespace NJS.Application.Dtos
{
    public class ChangeControlDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int SrNo { get; set; }
        public DateTime DateLogged { get; set; }
        public string Originator { get; set; }
        public string Description { get; set; }
        public string CostImpact { get; set; }
        public string TimeImpact { get; set; }
        public string ResourcesImpact { get; set; }
        public string QualityImpact { get; set; }
        public string ChangeOrderStatus { get; set; }
        public string ClientApprovalStatus { get; set; }
        public string ClaimSituation { get; set; }
    }
}
