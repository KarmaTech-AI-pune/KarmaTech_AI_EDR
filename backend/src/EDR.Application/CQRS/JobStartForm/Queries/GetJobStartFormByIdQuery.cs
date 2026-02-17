using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.JobStartForm.Queries
{
    public class GetJobStartFormByIdQuery : IRequest<JobStartFormDto>
    {
        public int Id { get; }
        public int FormId { get; }

        public GetJobStartFormByIdQuery(int id)
        {
            Id = id;
            FormId = id;
        }
    }

    public class GetJobStartFormByIdQueryHandler : IRequestHandler<GetJobStartFormByIdQuery, JobStartFormDto>
    {
        private readonly IJobStartFormRepository _jobStartFormRepository;

        public GetJobStartFormByIdQueryHandler(IJobStartFormRepository jobStartFormRepository)
        {
            _jobStartFormRepository = jobStartFormRepository;
        }

        public async Task<JobStartFormDto> Handle(GetJobStartFormByIdQuery request, CancellationToken cancellationToken)
        {
            var jobStartForm = await _jobStartFormRepository.GetByIdAsync(request.FormId);

            if (jobStartForm == null)
                return null;

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

                // Deserialize complex objects from JSON
                TotalTimeCost = jobStartForm.TotalTimeCost,
                TotalExpenses = jobStartForm.TotalExpenses,
                ServiceTaxPercentage = jobStartForm.ServiceTaxPercentage,
                ServiceTaxAmount = jobStartForm.ServiceTaxAmount,

                // Financial fields
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

                // *** ADDED MAPPING FOR RESOURCES ***
                Resources = jobStartForm.Resources?.Select(r => new JobStartFormResourceDto // Use correct navigation property 'Resources'
                {
                    ResourceId = r.ResourceId, // Map ResourceId
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
                    CreatedDate = r.CreatedDate, // Map CreatedDate
                    UpdatedDate = r.UpdatedDate  // Map UpdatedDate
                }).ToList() ?? new List<JobStartFormResourceDto>()
                // *** END ADDED MAPPING ***
            };
        }
    }
}

