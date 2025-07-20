using MediatR;
using NJS.Application.CQRS.JobStartForm.Commands;
using NJS.Domain.UnitWork;
using NJS.Domain.Entities;
using NJS.Domain.Database;
using Microsoft.EntityFrameworkCore;

namespace NJS.Application.CQRS.JobStartForm.Handlers
{
    public class UpdateJobStartFormCommandHandler : IRequestHandler<UpdateJobStartFormCommand>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ProjectManagementContext _context;

        public UpdateJobStartFormCommandHandler(IUnitOfWork unitOfWork, ProjectManagementContext context) // Add context to constructor
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _context = context ?? throw new ArgumentNullException(nameof(context)); 
        }

        public async Task Handle(UpdateJobStartFormCommand command, CancellationToken cancellationToken)
        {
            if (command.JobStartFormDto == null)
                throw new ArgumentNullException(nameof(command.JobStartFormDto), "Job Start Form DTO cannot be null");

            if (command.JobStartFormDto.FormId <= 0)
                throw new ArgumentException("Invalid FormId in DTO", nameof(command.JobStartFormDto.FormId));

            var jobStartForm = await _context.JobStartForms
                                             .Include(j => j.Selections)
                                             .Include(j => j.Resources)
                                             .FirstOrDefaultAsync(j => j.FormId == command.JobStartFormDto.FormId && !j.IsDeleted, cancellationToken);

            if (jobStartForm != null)
            {
                jobStartForm.ProjectId = command.JobStartFormDto.ProjectId;
                jobStartForm.WorkBreakdownStructureId = command.JobStartFormDto.WorkBreakdownStructureId;
                jobStartForm.FormTitle = command.JobStartFormDto.FormTitle;
                jobStartForm.Description = command.JobStartFormDto.Description;
                jobStartForm.StartDate = command.JobStartFormDto.StartDate;
                jobStartForm.PreparedBy = command.JobStartFormDto.PreparedBy;

                // Manually map calculated summary fields from DTO to Entity
                jobStartForm.TotalTimeCost = command.JobStartFormDto.TotalTimeCost;
                jobStartForm.TotalExpenses = command.JobStartFormDto.TotalExpenses;
                jobStartForm.ServiceTaxAmount = command.JobStartFormDto.ServiceTaxAmount;
                jobStartForm.ServiceTaxPercentage = command.JobStartFormDto.ServiceTaxPercentage;
                jobStartForm.GrandTotal = command.JobStartFormDto.GrandTotal;
                jobStartForm.ProjectFees = command.JobStartFormDto.ProjectFees;
                jobStartForm.TotalProjectFees = command.JobStartFormDto.TotalProjectFees;
                jobStartForm.Profit = command.JobStartFormDto.Profit;
                jobStartForm.ProfitPercentage = command.JobStartFormDto.ProfitPercentage;
                jobStartForm.UpdatedDate = DateTime.UtcNow; // Set UpdatedDate

                // --- Update Selections (Clear and Add strategy) ---
                // Since Selections were loaded with .Include(), EF Core knows about the existing ones.
                // Clearing the collection marks existing related entities for deletion.
                jobStartForm.Selections.Clear();

                // Add new/updated selections from DTO. EF Core will mark these as added.
                if (command.JobStartFormDto.Selections?.Any() == true)
                {
                    foreach (var selectionDto in command.JobStartFormDto.Selections)
                    {
                        jobStartForm.Selections.Add(new JobStartFormSelection
                        {
                            // FormId will be set by EF Core relationship fixup
                            OptionCategory = selectionDto.OptionCategory ?? string.Empty,
                            OptionName = selectionDto.OptionName ?? string.Empty,
                            IsSelected = selectionDto.IsSelected,
                            Notes = selectionDto.Notes ?? string.Empty
                        });
                    }
                }
                // --- End Update Selections ---

                // --- Update Resources (Clear and Add strategy) ---
                // Since Resources were loaded with .Include(), EF Core knows about the existing ones.
                // Clearing the collection marks existing related entities for deletion.
                jobStartForm.Resources.Clear();

                // Add new/updated resources from DTO. EF Core will mark these as added.
                if (command.JobStartFormDto.Resources?.Any() == true)
                {
                    foreach (var resourceDto in command.JobStartFormDto.Resources)
                    {
                        jobStartForm.Resources.Add(new JobStartFormResource
                        {
                            WBSTaskId = resourceDto.WBSTaskId,
                            TaskType = resourceDto.TaskType,
                            Description = resourceDto.Description ?? string.Empty,
                            Rate = resourceDto.Rate,
                            Units = resourceDto.Units,
                            BudgetedCost = resourceDto.BudgetedCost,
                            Remarks = resourceDto.Remarks ?? string.Empty,
                            EmployeeName = resourceDto.EmployeeName ?? string.Empty,
                            Name = resourceDto.Name ?? string.Empty,
                            CreatedDate = DateTime.Now,
                            UpdatedDate = DateTime.Now
                        });
                    }
                }
                // --- End Update Resources ---

                // SaveChangesAsync will detect changes to jobStartForm and its collections.
                await _unitOfWork.SaveChangesAsync();
            }
        }
    }
}
