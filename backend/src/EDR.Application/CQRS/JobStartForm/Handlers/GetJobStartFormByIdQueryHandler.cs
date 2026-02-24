using MediatR;
using EDR.Application.CQRS.JobStartForm.Queries;
using EDR.Application.Dtos;
using EDR.Domain.UnitWork;
using Microsoft.EntityFrameworkCore;

namespace EDR.Application.CQRS.JobStartForm.Handlers
{
    public class GetJobStartFormByIdQueryHandler : IRequestHandler<GetJobStartFormByIdQuery, JobStartFormDto>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetJobStartFormByIdQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<JobStartFormDto> Handle(GetJobStartFormByIdQuery query, CancellationToken cancellationToken)
        {
            var jobStartForm = await _unitOfWork.GetRepository<EDR.Domain.Entities.JobStartForm>()
                                                .Query() 
                                                .Include(jsf => jsf.Selections)
                                                .Include(jsf => jsf.Resources) 
                                                .FirstOrDefaultAsync(jsf => jsf.FormId == query.FormId, cancellationToken); // Updated to query.FormId

            if (jobStartForm == null)
            {
                return null!; 
            }

            return new JobStartFormDto
            {
                FormId = jobStartForm.FormId,
                ProjectId = jobStartForm.ProjectId,
                WorkBreakdownStructureId = jobStartForm.WorkBreakdownStructureId,
                FormTitle = jobStartForm.FormTitle,
                Description = jobStartForm.Description,
                StartDate = jobStartForm.StartDate,
                PreparedBy = jobStartForm.PreparedBy,
                CreatedDate = jobStartForm.CreatedDate,
                UpdatedDate = jobStartForm.UpdatedDate,
                // Financial fields
                TotalTimeCost = jobStartForm.TotalTimeCost,
                TotalExpenses = jobStartForm.TotalExpenses,
                ServiceTaxPercentage = jobStartForm.ServiceTaxPercentage,
                ServiceTaxAmount = jobStartForm.ServiceTaxAmount,
                GrandTotal = jobStartForm.GrandTotal,
                ProjectFees = jobStartForm.ProjectFees,
                TotalProjectFees = jobStartForm.TotalProjectFees,
                Profit = jobStartForm.Profit,
                ProfitPercentage = jobStartForm.ProfitPercentage,

                // Map selections
                Selections = jobStartForm.Selections.Select(s => new JobStartFormSelectionDto
                {
                    SelectionId = s.SelectionId,
                    FormId = s.FormId,
                    OptionCategory = s.OptionCategory,
                    OptionName = s.OptionName,
                    IsSelected = s.IsSelected,
                    Notes = s.Notes
                }).ToList(),

                // Map resources
                Resources = jobStartForm.Resources.Select(r => new JobStartFormResourceDto
                {
                    ResourceId = r.ResourceId,
                    FormId = r.FormId,
                    WBSTaskId = r.WBSTaskId,
                    TaskType = r.TaskType,
                    Description = r.Description,
                    Rate = r.Rate,
                    Units = r.Units,
                    BudgetedCost = r.BudgetedCost,
                    Remarks = r.Remarks,
                    EmployeeName = r.EmployeeName,
                    Name = r.Name,
                    CreatedDate = r.CreatedDate,
                    UpdatedDate = r.UpdatedDate
                }).ToList()
            };
        }
    }
}

