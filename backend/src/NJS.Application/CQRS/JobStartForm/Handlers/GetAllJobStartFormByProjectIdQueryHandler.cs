using MediatR;
using NJS.Application.CQRS.JobStartForm.Queries;
using NJS.Application.Dtos;
using NJS.Domain.UnitWork;
using Microsoft.EntityFrameworkCore;

namespace NJS.Application.CQRS.JobStartForm.Handlers
{
    public class GetAllJobStartFormByProjectIdQueryHandler : IRequestHandler<GetAllJobStartFormByProjectIdQuery, IEnumerable<JobStartFormDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetAllJobStartFormByProjectIdQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<JobStartFormDto>> Handle(GetAllJobStartFormByProjectIdQuery query, CancellationToken cancellationToken)
        {
            var jobStartForms = await _unitOfWork.GetRepository<NJS.Domain.Entities.JobStartForm>()
                                                .Query()
                                                .Where(jsf => jsf.ProjectId == query.ProjectId)
                                                .Include(jsf => jsf.Selections)
                                                .Include(jsf => jsf.Resources)
                                                .ToListAsync(cancellationToken);

            return jobStartForms.Select(jobStartForm => new JobStartFormDto
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
            });
        }
    }
}
