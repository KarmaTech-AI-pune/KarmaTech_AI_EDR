using MediatR;
using NJS.Application.CQRS.Projects.Queries;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Projects.Handlers
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
            if (project.EstimatedProjectCost > 0)
            {
                utilizationPercentage = ((project.EstimatedProjectFee ?? 0) / project.EstimatedProjectCost.Value) * 100;
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
                EstimatedBudget = project.EstimatedProjectCost ?? 0,
                ActualCost = project.EstimatedProjectFee ?? 0 // Using fee as "actual cost" for demo
            };

            return Task.FromResult(result);
        }
    }
}
