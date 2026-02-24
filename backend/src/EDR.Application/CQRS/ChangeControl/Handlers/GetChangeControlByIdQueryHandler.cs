using MediatR;
using EDR.Application.CQRS.ChangeControl.Queries;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.ChangeControl.Handlers
{
    public class GetChangeControlByIdQueryHandler : IRequestHandler<GetChangeControlByIdQuery, ChangeControlDto>
    {
        private readonly IChangeControlRepository _changeControlRepository;

        public GetChangeControlByIdQueryHandler(IChangeControlRepository changeControlRepository)
        {
            _changeControlRepository = changeControlRepository ?? throw new ArgumentNullException(nameof(changeControlRepository));
        }

        public async Task<ChangeControlDto> Handle(GetChangeControlByIdQuery request, CancellationToken cancellationToken)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var entity = await _changeControlRepository.GetByIdAsync(request.Id);
            if (entity == null)
                return null;

            return new ChangeControlDto
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
            };
        }
    }
}

