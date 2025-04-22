using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;

namespace NJS.Application.CQRS.JobStartForm.Queries
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
            };
        }
    }
}
