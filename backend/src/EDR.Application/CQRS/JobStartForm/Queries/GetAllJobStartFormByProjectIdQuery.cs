using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EDR.Application.CQRS.JobStartForm.Queries
{
    public class GetAllJobStartFormByProjectIdQuery : IRequest<IEnumerable<JobStartFormDto>>
    {
        public int ProjectId { get; }

        public GetAllJobStartFormByProjectIdQuery(int projectId)
        {
            ProjectId = projectId;
        }
    }

    public class GetAllJobStartFormByProjectIdQueryHandler : IRequestHandler<GetAllJobStartFormByProjectIdQuery, IEnumerable<JobStartFormDto>>
    {
        private readonly IJobStartFormRepository _jobStartFormRepository;

        public GetAllJobStartFormByProjectIdQueryHandler(IJobStartFormRepository jobStartFormRepository)
        {
            _jobStartFormRepository = jobStartFormRepository;
        }

        public async Task<IEnumerable<JobStartFormDto>> Handle(GetAllJobStartFormByProjectIdQuery request, CancellationToken cancellationToken)
        {
            var jobStartForms = await _jobStartFormRepository.GetAllByProjectIdAsync(request.ProjectId);

            return jobStartForms.Select(jobStartForm => new JobStartFormDto
            {
                FormId = jobStartForm.FormId,
                ProjectId = jobStartForm.ProjectId,
                WorkBreakdownStructureId = jobStartForm.WorkBreakdownStructureId,
                FormTitle = jobStartForm.FormTitle ?? "Job Start Form",
                Description = jobStartForm.Description ?? "",
                StartDate = jobStartForm.StartDate,
                PreparedBy = jobStartForm.PreparedBy ?? "",
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

                // Selections
                Selections = jobStartForm.Selections?.Select(s => new JobStartFormSelectionDto
                {
                    SelectionId = s.SelectionId,
                    FormId = s.FormId,
                    OptionCategory = s.OptionCategory,
                    OptionName = s.OptionName,
                    IsSelected = s.IsSelected,
                    Notes = s.Notes
                }).ToList() ?? new List<JobStartFormSelectionDto>(),

                // Resources
                Resources = jobStartForm.Resources?.Select(r => new JobStartFormResourceDto
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
                    Name = r.Name
                }).ToList() ?? new List<JobStartFormResourceDto>()
            });
        }
    }
}

