using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.DTOs;
using NJS.Application.Queries;
using NJS.Infrastructure.Data;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.Handlers
{
    public class GetBudgetHealthHandler : IRequestHandler<GetBudgetHealthQuery, BudgetHealthDto>
    {
        private readonly ApplicationDbContext _context;

        public GetBudgetHealthHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<BudgetHealthDto> Handle(GetBudgetHealthQuery request, CancellationToken cancellationToken)
        {
            var project = await _context.Projects
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

            if (project == null)
            {
                throw new Exception($"Project with ID {request.ProjectId} not found");
            }

            // Calculate utilization using EstimatedProjectFee as "actual cost"
            decimal utilizationPercentage = 0;
            if (project.EstimatedProjectCost > 0)
            {
                utilizationPercentage = (project.EstimatedProjectFee / project.EstimatedProjectCost) * 100;
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

            return new BudgetHealthDto
            {
                ProjectId = project.Id,
                Status = status,
                UtilizationPercentage = Math.Round(utilizationPercentage, 2),
                EstimatedBudget = project.EstimatedProjectCost,
                ActualCost = project.EstimatedProjectFee // Using fee as "actual cost" for demo
            };
        }
    }
}
