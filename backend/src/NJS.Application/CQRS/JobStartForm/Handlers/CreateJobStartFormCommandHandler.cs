using MediatR;
using NJS.Domain.Entities;
using NJS.Domain.UnitWork;
using NJS.Repositories.Interfaces;
using NJS.Application.CQRS.JobStartForm.Commands;

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

            if (request.JobStartForm.ProjectId <= 0)
                throw new ArgumentException("Invalid ProjectId", nameof(request.JobStartForm.ProjectId));

            if (request.JobStartForm.FormId != 0)
                throw new ArgumentException("FormID must not be provided for new entries. Use update instead.");

            var jobStartForm = new NJS.Domain.Entities.JobStartForm
            {
                ProjectId = request.JobStartForm.ProjectId,
                WorkBreakdownStructureId = request.JobStartForm.WorkBreakdownStructureId,
                FormTitle = request.JobStartForm.FormTitle ?? string.Empty,
                Description = request.JobStartForm.Description ?? string.Empty,
                StartDate = request.JobStartForm.StartDate,
                PreparedBy = request.JobStartForm.PreparedBy ?? string.Empty,
                CreatedDate = DateTime.Now,

                TotalTimeCost = request.JobStartForm.TotalTimeCost,
                TotalExpenses = request.JobStartForm.TotalExpenses,
                ServiceTaxAmount = request.JobStartForm.ServiceTaxAmount,
                ServiceTaxPercentage = request.JobStartForm.ServiceTaxPercentage,

                GrandTotal = request.JobStartForm.GrandTotal,
                ProjectFees = request.JobStartForm.ProjectFees,
                TotalProjectFees = request.JobStartForm.TotalProjectFees,
                Profit = request.JobStartForm.Profit,
                ProfitPercentage = request.JobStartForm.ProfitPercentage
            };

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

            if (request.JobStartForm.Resources?.Any() == true)
            {
                foreach (var resource in request.JobStartForm.Resources)
                {
                    jobStartForm.Resources.Add(new JobStartFormResource
                    {
                        WBSTaskId = resource.WBSTaskId,
                        TaskType = resource.TaskType, 
                        Description = resource.Description ?? string.Empty,
                        Rate = resource.Rate,
                        Units = resource.Units,
                        BudgetedCost = resource.BudgetedCost,
                        Remarks = resource.Remarks ?? string.Empty,
                        EmployeeName = resource.EmployeeName ?? string.Empty, 
                        Name = resource.Name ?? string.Empty, 
                        CreatedDate = DateTime.Now
                    });
                }
            }

            await _jobStartFormRepository.AddAsync(jobStartForm);
            await _unitOfWork.SaveChangesAsync();

            return jobStartForm.FormId;
        }
    }
}
