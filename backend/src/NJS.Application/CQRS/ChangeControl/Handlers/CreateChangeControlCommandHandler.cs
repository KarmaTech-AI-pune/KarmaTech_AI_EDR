using MediatR;
using NJS.Application.CQRS.ChangeControl.Commands;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.ChangeControl.Handlers
{
    public class CreateChangeControlCommandHandler : IRequestHandler<CreateChangeControlCommand, int>
    {
        private readonly IChangeControlRepository _changeControlRepository;

        public CreateChangeControlCommandHandler(IChangeControlRepository changeControlRepository)
        {
            _changeControlRepository = changeControlRepository ?? throw new ArgumentNullException(nameof(changeControlRepository));
        }

        public async Task<int> Handle(CreateChangeControlCommand request, CancellationToken cancellationToken)
        {
            if (request == null || request.ChangeControlDto == null)
                throw new ArgumentNullException(nameof(request));

            // Ensure all string fields have values and set audit fields
            var entity = new NJS.Domain.Entities.ChangeControl
            {
                ProjectId = request.ChangeControlDto.ProjectId,
                SrNo = request.ChangeControlDto.SrNo,
                DateLogged = request.ChangeControlDto.DateLogged,
                Originator = request.ChangeControlDto.Originator ?? string.Empty,
                Description = request.ChangeControlDto.Description ?? string.Empty,
                CostImpact = request.ChangeControlDto.CostImpact ?? string.Empty,
                TimeImpact = request.ChangeControlDto.TimeImpact ?? string.Empty,
                ResourcesImpact = request.ChangeControlDto.ResourcesImpact ?? string.Empty,
                QualityImpact = request.ChangeControlDto.QualityImpact ?? string.Empty,
                ChangeOrderStatus = request.ChangeControlDto.ChangeOrderStatus ?? string.Empty,
                ClientApprovalStatus = request.ChangeControlDto.ClientApprovalStatus ?? string.Empty,
                ClaimSituation = request.ChangeControlDto.ClaimSituation ?? string.Empty,
                // Always set audit fields with default values if not provided
                CreatedBy = string.IsNullOrEmpty(request.ChangeControlDto.CreatedBy) ? "System" : request.ChangeControlDto.CreatedBy,
                CreatedAt = DateTime.UtcNow,
                UpdatedBy = string.IsNullOrEmpty(request.ChangeControlDto.UpdatedBy) ? "System" : request.ChangeControlDto.UpdatedBy,
                UpdatedAt = DateTime.UtcNow
            };

            return await _changeControlRepository.AddAsync(entity);
        }
    }
}
