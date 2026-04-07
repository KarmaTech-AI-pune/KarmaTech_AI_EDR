using MediatR;

namespace EDR.Application.CQRS.Dashboard.ProjectDashboard.Queries
{
    public class GetProjectProfitMarginQuery : IRequest<ProjectProfitMarginDto>
    {
        public int ProjectId { get; set; }
    }

    public class ProjectProfitMarginDto
    {
        public decimal ProfitMargin { get; set; }
        public string ProfitMarginChangeDescription { get; set; }
        public string ProfitMarginChangeType { get; set; }
    }
}
