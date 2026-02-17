using MediatR;
using EDR.Application.CQRS.Projects.Queries;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Projects.Handlers
{
    public class GetBudgetHealthQueryHandler : IRequestHandler<GetBudgetHealthQuery, BudgetHealthDto>
    {
        private readonly IProjectRepository _repository;

        public GetBudgetHealthQueryHandler(IProjectRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public Task<BudgetHealthDto> Handle(GetBudgetHealthQuery request, CancellationToken cancellationToken)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var project = _repository.GetById(request.ProjectId);
            if (project == null)
                throw new ArgumentException($"Project with ID {request.ProjectId} not found");

            // Calculate utilization: (ActualCost / EstimatedBudget) * 100
            decimal utilizationPercentage = 0;
            var estimatedCost = project.EstimatedProjectCost ?? 0;
            var estimatedFee = project.EstimatedProjectFee ?? 0;
            
            if (estimatedCost > 0)
            {
                utilizationPercentage = (estimatedFee / estimatedCost) * 100;
            }

            // Determine status based on thresholds
            string status;
            if (utilizationPercentage < 90)
            {
                status = "Healthy";
            }
            else if (utilizationPercentage >= 90 && utilizationPercentage <= 100)
            {
                status = "Warning";
            }
            else
            {
                status = "Critical";
            }

            var result = new BudgetHealthDto
            {
                ProjectId = project.Id,
                Status = status,
                UtilizationPercentage = Math.Round(utilizationPercentage, 2),
                EstimatedBudget = estimatedCost,
                ActualCost = estimatedFee // Using fee as "actual cost" for demo
            };

            return Task.FromResult(result);
        }
    }
}

