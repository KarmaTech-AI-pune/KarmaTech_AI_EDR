using MediatR;
using NJS.Application.CQRS.JobStartForm.Queries;
using NJS.Application.Dtos;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using NJS.Domain.UnitWork;
using NJS.Domain.Entities;
using System.Linq;
using Microsoft.EntityFrameworkCore; // Add for Include/ToListAsync

namespace NJS.Application.CQRS.JobStartForm.Handlers
{
    public class GetJobStartFormByProjectIdQueryHandler : IRequestHandler<GetJobStartFormByProjectIdQuery, IEnumerable<JobStartFormDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetJobStartFormByProjectIdQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<JobStartFormDto>> Handle(GetJobStartFormByProjectIdQuery query, CancellationToken cancellationToken)
        {
            // Use generic repository, filter by ProjectId, include Selections
            var jobStartForms = await _unitOfWork.GetRepository<NJS.Domain.Entities.JobStartForm>()
                                                .Query()
                                                .Where(jsf => jsf.ProjectId == query.ProjectId)
                                                .Include(jsf => jsf.Selections)
                                                .ToListAsync(cancellationToken);

            // Map entities to DTOs
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
                Selections = jobStartForm.Selections.Select(s => new JobStartFormSelectionDto
                {
                    SelectionId = s.SelectionId,
                    FormId = s.FormId,
                    OptionCategory = s.OptionCategory,
                    OptionName = s.OptionName,
                    IsSelected = s.IsSelected,
                    Notes = s.Notes
                }).ToList()
            });
        }
    }
}
