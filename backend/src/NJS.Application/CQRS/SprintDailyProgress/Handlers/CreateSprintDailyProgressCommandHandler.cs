using AutoMapper;
using MediatR;
using NJS.Application.CQRS.SprintDailyProgresses.Commands; // Updated namespace
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using Microsoft.EntityFrameworkCore; // Added for AnyAsync extension method
using NJS.Domain.GenericRepository;
using NJS.Domain.UnitWork; // Added for IUnitOfWork
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.SprintDailyProgresses.Handlers // Updated namespace
{
    public class CreateSprintDailyProgressCommandHandler : IRequestHandler<CreateSprintDailyProgressCommand, SprintDailyProgressDto>
    {
        private readonly IUnitOfWork _unitOfWork; // Changed to non-generic
        private readonly IMapper _mapper;

        public CreateSprintDailyProgressCommandHandler(IUnitOfWork unitOfWork, IMapper mapper) // Changed to non-generic
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<SprintDailyProgressDto> Handle(CreateSprintDailyProgressCommand request, CancellationToken cancellationToken)
        {
            // Validate if SprintPlanId exists
            var sprintPlanRepository = _unitOfWork.GetRepository<SprintPlan>();
            var sprintPlanExists = await sprintPlanRepository.Query().AnyAsync(sp => sp.SprintId == request.SprintPlanId, cancellationToken);

            if (!sprintPlanExists)
            {
                throw new KeyNotFoundException($"SprintPlan with ID {request.SprintPlanId} not found.");
            }

            var sprintDailyProgress = _mapper.Map<SprintDailyProgress>(request);
            sprintDailyProgress.TenantId = request.TenantId; // Explicitly set TenantId
            sprintDailyProgress.CreatedAt = DateTime.UtcNow;
            sprintDailyProgress.UpdatedAt = DateTime.UtcNow; // Initialize UpdatedAt as well

            await _unitOfWork.GetRepository<SprintDailyProgress>().AddAsync(sprintDailyProgress);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<SprintDailyProgressDto>(sprintDailyProgress);
        }
    }
}
