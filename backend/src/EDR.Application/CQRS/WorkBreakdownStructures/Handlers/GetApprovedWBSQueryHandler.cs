using MediatR;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Domain.UnitWork;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDR.Application.CQRS.WorkBreakdownStructures.Queries;
using EDR.Repositories.Interfaces;
using Microsoft.Extensions.Logging; // Added for logging

namespace EDR.Application.CQRS.WorkBreakdownStructures.Handlers
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
                    ProjectId = wbs.WBSHeader.ProjectId, // Access ProjectId through WBSHeader
                    Tasks = new List<WBSTaskDto>()
                };

                foreach (var task in wbs.Tasks)
                {
                    var taskDto = new WBSTaskDto
                    {
                        Id = task.Id,
                        WorkBreakdownStructureId = task.WorkBreakdownStructureId,
                        Level = task.Level,
                        Title = task.Title,
                        Description = task.Description,
                        DisplayOrder = task.DisplayOrder,
                        EstimatedBudget = task.EstimatedBudget,
                        StartDate = task.StartDate,
                        EndDate = task.EndDate,
                        TaskType = task.TaskType,
                        // Re-adding properties as per user request to map all fields in WBSTaskDto
                        AssignedUserId = task.UserWBSTasks.FirstOrDefault()?.UserId,
                        AssignedUserName = task.UserWBSTasks.FirstOrDefault()?.User?.Name, // Use Name from User entity
                        CostRate = task.UserWBSTasks.FirstOrDefault()?.User?.StandardRate ?? 0, // Use StandardRate from User entity
                        ResourceName = task.UserWBSTasks.FirstOrDefault()?.User?.Name, // Assuming ResourceName is the user's name from User entity
                        ResourceUnit = task.UserWBSTasks.FirstOrDefault()?.Unit, // Assuming ResourceUnit is the unit from UserWBSTask
                        PlannedHours = new List<PlannedHourDto>(),
                        TotalHours = task.PlannedHours.Sum(ph => ph.PlannedHours), // Calculate total hours
                        TotalCost = (decimal)task.PlannedHours.Sum(ph => ph.PlannedHours) * (task.UserWBSTasks.FirstOrDefault()?.User?.StandardRate ?? 0), // Calculate total cost using StandardRate from User entity
                    };

                    foreach (var plannedHour in task.PlannedHours)
                    {
                        taskDto.PlannedHours.Add(new PlannedHourDto
                        {
                            Year = int.Parse(plannedHour.Year), // Convert string to int
                            Month = plannedHour.Month,
                            PlannedHours = plannedHour.PlannedHours
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

