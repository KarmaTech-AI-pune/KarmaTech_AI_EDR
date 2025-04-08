using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NJS.Domain.Entities;
using NJS.Domain.UnitWork;
using NJS.Repositories.Interfaces;
using NJS.Application.CQRS.JobStartForm.Commands;
using NJS.Application.Dtos;
using System.Linq;

namespace NJS.Application.CQRS.JobStartForm.Handlers
{
    public class CreateJobStartFormCommandHandler : IRequestHandler<CreateJobStartFormCommand, int>
    {
        private readonly IJobStartFormRepository _jobStartFormRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CreateJobStartFormCommandHandler(
            IJobStartFormRepository jobStartFormRepository, 
            IUnitOfWork unitOfWork)
        {
            _jobStartFormRepository = jobStartFormRepository ?? 
                throw new ArgumentNullException(nameof(jobStartFormRepository));
            _unitOfWork = unitOfWork ?? 
                throw new ArgumentNullException(nameof(unitOfWork));
        }

        public async Task<int> Handle(CreateJobStartFormCommand request, CancellationToken cancellationToken)
        {
            if (request.JobStartForm == null)
                throw new ArgumentNullException(nameof(request.JobStartForm), "Job Start Form cannot be null");

            // Validate required fields
            if (request.JobStartForm.ProjectId <= 0)
                throw new ArgumentException("Invalid ProjectId", nameof(request.JobStartForm.ProjectId));

            // Check for existing form
            var existingForm = (await _jobStartFormRepository.GetAllByProjectIdAsync(request.JobStartForm.ProjectId)).FirstOrDefault();
            
            if (existingForm != null)
            {
                // Update existing form
                existingForm.WorkBreakdownStructureId = request.JobStartForm.WorkBreakdownStructureId;
                existingForm.FormTitle = request.JobStartForm.FormTitle ?? string.Empty;
                existingForm.Description = request.JobStartForm.Description ?? string.Empty;
                existingForm.StartDate = request.JobStartForm.StartDate;
                existingForm.PreparedBy = request.JobStartForm.PreparedBy ?? string.Empty;
                existingForm.UpdatedDate = DateTime.UtcNow;

                // Update serialized data
                existingForm.TimeDataJson = request.JobStartForm.Time != null 
                    ? JsonSerializer.Serialize(request.JobStartForm.Time) 
                    : null;
                existingForm.ExpensesDataJson = request.JobStartForm.Expenses != null 
                    ? JsonSerializer.Serialize(request.JobStartForm.Expenses) 
                    : null;
                existingForm.ServiceTaxJson = request.JobStartForm.ServiceTax != null 
                    ? JsonSerializer.Serialize(request.JobStartForm.ServiceTax) 
                    : null;

                // Update financial fields
                existingForm.GrandTotal = request.JobStartForm.GrandTotal;
                existingForm.ProjectFees = request.JobStartForm.ProjectFees;
                existingForm.TotalProjectFees = request.JobStartForm.TotalProjectFees;
                existingForm.Profit = request.JobStartForm.Profit;

                await _jobStartFormRepository.UpdateAsync(existingForm);
                await _unitOfWork.SaveChangesAsync();
                return existingForm.FormId;
            }

            // Create new form
            var jobStartForm = new NJS.Domain.Entities.JobStartForm
            {
                ProjectId = request.JobStartForm.ProjectId,
                WorkBreakdownStructureId = request.JobStartForm.WorkBreakdownStructureId,
                FormTitle = request.JobStartForm.FormTitle ?? string.Empty,
                Description = request.JobStartForm.Description ?? string.Empty,
                StartDate = request.JobStartForm.StartDate,
                PreparedBy = request.JobStartForm.PreparedBy ?? string.Empty,
                CreatedDate = DateTime.UtcNow,
                
                // Serialize complex objects to JSON, handling null cases
                TimeDataJson = request.JobStartForm.Time != null 
                    ? JsonSerializer.Serialize(request.JobStartForm.Time) 
                    : null,
                
                ExpensesDataJson = request.JobStartForm.Expenses != null 
                    ? JsonSerializer.Serialize(request.JobStartForm.Expenses) 
                    : null,
                
                ServiceTaxJson = request.JobStartForm.ServiceTax != null 
                    ? JsonSerializer.Serialize(request.JobStartForm.ServiceTax) 
                    : null,

                // Financial fields with null checks
                GrandTotal = request.JobStartForm.GrandTotal,
                ProjectFees = request.JobStartForm.ProjectFees,
                TotalProjectFees = request.JobStartForm.TotalProjectFees,
                Profit = request.JobStartForm.Profit
            };

            // Add selections if any, with null checks
            if (request.JobStartForm.Selections?.Any() == true)
            {
                foreach (var selection in request.JobStartForm.Selections)
                {
                    jobStartForm.Selections.Add(new JobStartFormSelection
                    {
                        OptionCategory = selection.OptionCategory ?? string.Empty,
                        OptionName = selection.OptionName ?? string.Empty,
                        IsSelected = selection.IsSelected,
                        Notes = selection.Notes ?? string.Empty
                    });
                }
            }

            // Add to repository and save
            await _jobStartFormRepository.AddAsync(jobStartForm);
            await _unitOfWork.SaveChangesAsync();

            return jobStartForm.FormId;
        }
    }
}
