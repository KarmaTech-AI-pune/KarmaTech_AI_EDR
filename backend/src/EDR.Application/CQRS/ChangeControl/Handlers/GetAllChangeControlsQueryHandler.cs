using MediatR;
using EDR.Application.CQRS.ChangeControl.Queries;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.ChangeControl.Handlers
{
    public class GetAllChangeControlsQueryHandler : IRequestHandler<GetAllChangeControlsQuery, IEnumerable<ChangeControlDto>>
    {
        private readonly IChangeControlRepository _changeControlRepository;

        public GetAllChangeControlsQueryHandler(IChangeControlRepository changeControlRepository)
        {
            _changeControlRepository = changeControlRepository ?? throw new ArgumentNullException(nameof(changeControlRepository));
        }

        public async Task<IEnumerable<ChangeControlDto>> Handle(GetAllChangeControlsQuery request, CancellationToken cancellationToken)
        {
            var entities = await _changeControlRepository.GetAllAsync();
            
            return entities.Select(entity => new ChangeControlDto
            {
                Id = entity.Id,
                ProjectId = entity.ProjectId,
                SrNo = entity.SrNo,
                DateLogged = entity.DateLogged,
                Originator = entity.Originator,
                Description = entity.Description,
                CostImpact = entity.CostImpact,
                TimeImpact = entity.TimeImpact,
                ResourcesImpact = entity.ResourcesImpact,
                QualityImpact = entity.QualityImpact,
                ChangeOrderStatus = entity.ChangeOrderStatus,
                ClientApprovalStatus = entity.ClientApprovalStatus,
                ClaimSituation = entity.ClaimSituation,
                CreatedBy = entity.CreatedBy,
                UpdatedBy = entity.UpdatedBy,
                WorkflowHistory = entity.WorkflowHistories.OrderByDescending(x => x.ActionDate)
                .Select(history => new ChangeControlWorkflowHistoryDto
                {
                    Id = history.Id,
                    ChangeControlId = history.ChangeControlId,
                    ActionDate = history.ActionDate,
                    Comments = history.Comments,                   
                    StatusId = history.StatusId,
                    Action = history.Action,
                    ActionBy = history.ActionBy,
                    AssignedToId = history.AssignedToId

                })
                .FirstOrDefault()
            });
        }
    }
}

