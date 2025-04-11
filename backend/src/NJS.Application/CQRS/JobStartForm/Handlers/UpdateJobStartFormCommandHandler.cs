using MediatR;
using NJS.Application.CQRS.JobStartForm.Commands;
using System.Threading;
using System.Threading.Tasks;
using NJS.Domain.UnitWork;
using NJS.Domain.Entities;
using NJS.Domain.Database; // Add using for ProjectManagementContext
using System;
using System.Linq;
using Microsoft.EntityFrameworkCore; // Add for LoadAsync and Entry

namespace NJS.Application.CQRS.JobStartForm.Handlers
{
    public class UpdateJobStartFormCommandHandler : IRequestHandler<UpdateJobStartFormCommand>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ProjectManagementContext _context; // Inject DbContext

        public UpdateJobStartFormCommandHandler(IUnitOfWork unitOfWork, ProjectManagementContext context) // Add context to constructor
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _context = context ?? throw new ArgumentNullException(nameof(context)); // Store injected context
        }

        public async Task Handle(UpdateJobStartFormCommand command, CancellationToken cancellationToken)
        {
            if (command.JobStartFormDto == null)
                throw new ArgumentNullException(nameof(command.JobStartFormDto), "Job Start Form DTO cannot be null");

            if (command.JobStartFormDto.FormId <= 0)
                throw new ArgumentException("Invalid FormId in DTO", nameof(command.JobStartFormDto.FormId));

            // Use the injected context directly to find and include Selections
            var jobStartForm = await _context.JobStartForms
                                             .Include(j => j.Selections) // Eager load Selections
                                             .FirstOrDefaultAsync(j => j.FormId == command.JobStartFormDto.FormId && !j.IsDeleted, cancellationToken);

            if (jobStartForm != null)
            {
                // Selections are now loaded due to .Include() above
                // No need for separate loading step here.
                // Update scalar properties based on JobStartFormDto
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

                // No need for explicit UpdateAsync call when the entity is tracked by the context.
                // SaveChangesAsync will detect changes to jobStartForm and its Selections collection.
                await _unitOfWork.SaveChangesAsync();
            }
        }
    }
}
