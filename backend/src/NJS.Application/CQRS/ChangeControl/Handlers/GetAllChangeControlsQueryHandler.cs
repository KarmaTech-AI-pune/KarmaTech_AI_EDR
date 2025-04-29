using MediatR;
using NJS.Application.CQRS.ChangeControl.Queries;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.ChangeControl.Handlers
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
                UpdatedBy = entity.UpdatedBy
            });
        }
    }
}
