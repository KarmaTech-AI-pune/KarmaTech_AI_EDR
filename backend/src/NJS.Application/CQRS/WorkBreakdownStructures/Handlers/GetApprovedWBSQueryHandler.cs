using MediatR;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using NJS.Domain.UnitWork;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using NJS.Repositories.Interfaces;
using Microsoft.Extensions.Logging; // Added for logging

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class GetApprovedWBSQueryHandler : IRequestHandler<GetApprovedWBSQuery, List<WBSDetailsDto>>
    {
        private readonly IWBSTaskRepository _wbsTaskRepository; // Changed to WBSTask Repository
        private readonly ILogger<GetApprovedWBSQueryHandler> _logger; // Added logger

        public GetApprovedWBSQueryHandler(IWBSTaskRepository wbsTaskRepository, ILogger<GetApprovedWBSQueryHandler> logger) // Updated constructor
        {
            _wbsTaskRepository = wbsTaskRepository; // Initialize WBSTask Repository
            _logger = logger; // Initialize logger
        }

        public async Task<List<WBSDetailsDto>> Handle(GetApprovedWBSQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Handling GetApprovedWBSQuery for ProjectId: {ProjectId}", request.ProjectId);
            try
            {
                var approvedWBS = await _wbsTaskRepository.GetApprovedWBSAsync(request.ProjectId); // Call repository method

            // Manual mapping from WorkBreakdownStructure entity to WBSDetailsDto
            var wbsDetailsDtos = new List<WBSDetailsDto>();
            foreach (var wbs in approvedWBS)
            {
                var wbsDto = new WBSDetailsDto
                {
                    Id = wbs.Id,
                    ProjectId = wbs.ProjectId,
                    Tasks = new List<WBSTaskDto>()
                };

                foreach (var task in wbs.Tasks)
                {
                    var taskDto = new WBSTaskDto
                    {
                        Id = task.Id,
                        WorkBreakdownStructureId = task.WorkBreakdownStructureId,
                        ParentId = task.ParentId,
                        Level = task.Level,
                        Title = task.Title,
                        Description = task.Description,
                        DisplayOrder = task.DisplayOrder,
                        EstimatedBudget = task.EstimatedBudget,
                        StartDate = task.StartDate,
                        EndDate = task.EndDate,
                        TaskType = task.TaskType,
                        // Re-adding properties as per user request to map all fields in WBSTaskDto
                        AssignedUserId = null, // Not directly available from WBSTask entity
                        AssignedUserName = null, // Not directly available from WBSTask entity
                        CostRate = 0, // Not directly available from WBSTask entity
                        ResourceName = null, // Not directly available from WBSTask entity
                        ResourceUnit = null, // Not directly available from WBSTask entity
                        MonthlyHours = new List<MonthlyHourDto>(),
                        TotalHours = 0, // Not directly available from WBSTask entity
                        TotalCost = 0, // Not directly available from WBSTask entity
                        FrontendTempId = null, // Not directly available from WBSTask entity
                        ParentFrontendTempId = null // Not directly available from WBSTask entity
                    };

                    foreach (var monthlyHour in task.MonthlyHours)
                    {
                        taskDto.MonthlyHours.Add(new MonthlyHourDto
                        {
                            Year = int.Parse(monthlyHour.Year), // Convert string to int
                            Month = monthlyHour.Month,
                            PlannedHours = monthlyHour.PlannedHours
                        });
                    }
                    wbsDto.Tasks.Add(taskDto);
                }
                wbsDetailsDtos.Add(wbsDto);
            }

                _logger.LogInformation("Successfully retrieved and mapped {Count} approved WBS entries.", wbsDetailsDtos.Count);
                return wbsDetailsDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling GetApprovedWBSQuery for ProjectId: {ProjectId}", request.ProjectId);
                throw; // Re-throw to be caught by middleware/global exception handler
            }
        }
    }
}
