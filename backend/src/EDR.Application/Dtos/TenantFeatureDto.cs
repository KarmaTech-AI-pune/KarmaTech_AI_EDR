namespace EDR.Application.Dtos
{
    public class TenantPlanDetailsDto
    {
        public int PlanId { get; set; }
        public string PlanName { get; set; }
        public List<TenantFeatureStatusDto> Features { get; set; } = new List<TenantFeatureStatusDto>();
    }

    public class TenantFeatureStatusDto
    {
        public string Name { get; set; }
        public bool Enabled { get; set; }
    }
}

