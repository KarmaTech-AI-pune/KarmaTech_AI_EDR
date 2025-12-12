using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.SprintDailyProgresses.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.GenericRepository;
using NJS.Domain.UnitWork;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.SprintDailyProgresses.Handlers
{
    public class UpdateSprintDailyProgressCommandHandler : IRequestHandler<UpdateSprintDailyProgressCommand, SprintDailyProgressDto>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UpdateSprintDailyProgressCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<SprintDailyProgressDto> Handle(UpdateSprintDailyProgressCommand request, CancellationToken cancellationToken)
        {
            // Validate if SprintPlanId exists
            var sprintPlanRepository = _unitOfWork.GetRepository<SprintPlan>();
            var sprintPlanExists = await sprintPlanRepository.Query().AnyAsync(sp => sp.SprintId == request.SprintPlanId, cancellationToken);

            if (!sprintPlanExists)
            {
                throw new KeyNotFoundException($"SprintPlan with ID {request.SprintPlanId} not found.");
            }

            // Retrieve the existing SprintDailyProgress entry
            var sprintDailyProgressRepository = _unitOfWork.GetRepository<SprintDailyProgress>();
            var existingProgress = await sprintDailyProgressRepository.Query()
                                                                      .FirstOrDefaultAsync(sdp => sdp.DailyProgressId == request.DailyProgressId &&
                                                                                                  sdp.SprintPlanId == request.SprintPlanId,
                                                                                                  cancellationToken);

            if (existingProgress == null)
            {
                throw new KeyNotFoundException($"SprintDailyProgress with ID {request.DailyProgressId} and SprintPlanId {request.SprintPlanId} not found.");
            }

            // Map updated values from the command to the existing entity
            _mapper.Map(request, existingProgress);

            existingProgress.UpdatedAt = DateTime.UtcNow;
            existingProgress.UpdatedBy = request.UpdatedBy;

            await sprintDailyProgressRepository.UpdateAsync(existingProgress);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<SprintDailyProgressDto>(existingProgress);
        }
    }
}
