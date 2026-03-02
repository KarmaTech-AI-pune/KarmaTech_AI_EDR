using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.SprintDailyProgresses.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.UnitWork;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.SprintDailyProgresses.Handlers
{
    public class GetSprintDailyProgressBySprintPlanIdQueryHandler : IRequestHandler<GetSprintDailyProgressBySprintPlanIdQuery, IEnumerable<SprintDailyProgressDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetSprintDailyProgressBySprintPlanIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<SprintDailyProgressDto>> Handle(GetSprintDailyProgressBySprintPlanIdQuery request, CancellationToken cancellationToken)
        {
            // Validate if SprintPlanId exists
            var sprintPlanRepository = _unitOfWork.GetRepository<SprintPlan>();
            var sprintPlanExists = await sprintPlanRepository.Query().AnyAsync(sp => sp.SprintId == request.SprintPlanId, cancellationToken);

            if (!sprintPlanExists)
            {
                throw new KeyNotFoundException($"SprintPlan with ID {request.SprintPlanId} not found.");
            }

            var sprintDailyProgresses = await _unitOfWork.GetRepository<SprintDailyProgress>()
                                                         .Query()
                                                         .Where(sdp => sdp.SprintPlanId == request.SprintPlanId)
                                                         .ToListAsync(cancellationToken);

            return _mapper.Map<IEnumerable<SprintDailyProgressDto>>(sprintDailyProgresses);
        }
    }
}

