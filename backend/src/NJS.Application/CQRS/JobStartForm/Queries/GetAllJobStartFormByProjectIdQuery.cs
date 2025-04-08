using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;

namespace NJS.Application.CQRS.JobStartForm.Queries
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
                FormTitle = jobStartForm.FormTitle,
                Description = jobStartForm.Description,
                StartDate = jobStartForm.StartDate,
                PreparedBy = jobStartForm.PreparedBy,
                CreatedDate = jobStartForm.CreatedDate,
                UpdatedDate = jobStartForm.UpdatedDate,

                // Deserialize complex objects from JSON
                Time = string.IsNullOrEmpty(jobStartForm.TimeDataJson) 
                    ? null 
                    : JsonSerializer.Deserialize<TimeDataDto>(jobStartForm.TimeDataJson),

                Expenses = string.IsNullOrEmpty(jobStartForm.ExpensesDataJson) 
                    ? null 
                    : JsonSerializer.Deserialize<ExpensesDataDto>(jobStartForm.ExpensesDataJson),

                ServiceTax = string.IsNullOrEmpty(jobStartForm.ServiceTaxJson) 
                    ? null 
                    : JsonSerializer.Deserialize<ServiceTaxDataDto>(jobStartForm.ServiceTaxJson),

                // Financial fields
                GrandTotal = jobStartForm.GrandTotal,
                ProjectFees = jobStartForm.ProjectFees,
                TotalProjectFees = jobStartForm.TotalProjectFees,
                Profit = jobStartForm.Profit,

                // Selections
                Selections = jobStartForm.Selections?.Select(s => new JobStartFormSelectionDto
                {
                    SelectionId = s.SelectionId,
                    FormId = s.FormId,
                    OptionCategory = s.OptionCategory,
                    OptionName = s.OptionName,
                    IsSelected = s.IsSelected,
                    Notes = s.Notes
                }).ToList() ?? new List<JobStartFormSelectionDto>()
            }).ToList();
        }
    }
}
