using MediatR;
using NJS.Application.CQRS.ChangeControl.Commands;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.ChangeControl.Handlers
{
    public class UpdateChangeControlCommandHandler : IRequestHandler<UpdateChangeControlCommand, ChangeControlDto>
    {
        private readonly IChangeControlRepository _changeControlRepository;

        public UpdateChangeControlCommandHandler(IChangeControlRepository changeControlRepository)
        {
            _changeControlRepository = changeControlRepository ?? throw new ArgumentNullException(nameof(changeControlRepository));
        }

        public async Task<ChangeControlDto> Handle(UpdateChangeControlCommand request, CancellationToken cancellationToken)
        {
            if (request == null || request.ChangeControlDto == null)
                throw new ArgumentNullException(nameof(request));

            var existingEntity = await _changeControlRepository.GetByIdAsync(request.ChangeControlDto.Id);
            if (existingEntity == null)
                throw new KeyNotFoundException($"ChangeControl with ID {request.ChangeControlDto.Id} not found.");

            // Update entity properties with null checks
            existingEntity.ProjectId = request.ChangeControlDto.ProjectId;
            existingEntity.SrNo = request.ChangeControlDto.SrNo;
            existingEntity.DateLogged = request.ChangeControlDto.DateLogged;
            existingEntity.Originator = request.ChangeControlDto.Originator;
            existingEntity.Description = request.ChangeControlDto.Description;
            existingEntity.CostImpact = request.ChangeControlDto.CostImpact ?? string.Empty;
            existingEntity.TimeImpact = request.ChangeControlDto.TimeImpact ?? string.Empty;
            existingEntity.ResourcesImpact = request.ChangeControlDto.ResourcesImpact ?? string.Empty;
            existingEntity.QualityImpact = request.ChangeControlDto.QualityImpact ?? string.Empty;
            existingEntity.ChangeOrderStatus = request.ChangeControlDto.ChangeOrderStatus ?? string.Empty;
            existingEntity.ClientApprovalStatus = request.ChangeControlDto.ClientApprovalStatus ?? string.Empty;
            existingEntity.ClaimSituation = request.ChangeControlDto.ClaimSituation ?? string.Empty;
            // Always set UpdatedBy with default value if not provided
            existingEntity.UpdatedBy = string.IsNullOrEmpty(request.ChangeControlDto.UpdatedBy) ? "System" : request.ChangeControlDto.UpdatedBy;
            existingEntity.UpdatedAt = DateTime.UtcNow;

            await _changeControlRepository.UpdateAsync(existingEntity);

            // Return updated entity as DTO
            return new ChangeControlDto
            {
                Id = existingEntity.Id,
                ProjectId = existingEntity.ProjectId,
                SrNo = existingEntity.SrNo,
                DateLogged = existingEntity.DateLogged,
                Originator = existingEntity.Originator,
                Description = existingEntity.Description,
                CostImpact = existingEntity.CostImpact,
                TimeImpact = existingEntity.TimeImpact,
                ResourcesImpact = existingEntity.ResourcesImpact,
                QualityImpact = existingEntity.QualityImpact,
                ChangeOrderStatus = existingEntity.ChangeOrderStatus,
                ClientApprovalStatus = existingEntity.ClientApprovalStatus,
                ClaimSituation = existingEntity.ClaimSituation,
                CreatedBy = existingEntity.CreatedBy,
                UpdatedBy = existingEntity.UpdatedBy
            };
        }
    }
}
