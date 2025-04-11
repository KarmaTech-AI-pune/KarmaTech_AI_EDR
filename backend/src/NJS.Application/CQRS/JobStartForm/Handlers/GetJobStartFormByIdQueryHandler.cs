using MediatR;
using NJS.Application.CQRS.JobStartForm.Queries;
using NJS.Application.Dtos;
using System.Threading;
using System.Threading.Tasks;
using NJS.Domain.UnitWork;
using NJS.Domain.Entities;
using System.Linq;
using Microsoft.EntityFrameworkCore; // Add for Include

namespace NJS.Application.CQRS.JobStartForm.Handlers
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
            // Use generic repository and include Selections
            var jobStartForm = await _unitOfWork.GetRepository<NJS.Domain.Entities.JobStartForm>()
                                                .Query() // Start queryable
                                                .Include(jsf => jsf.Selections) // Include related selections
                                                .FirstOrDefaultAsync(jsf => jsf.FormId == query.FormId, cancellationToken); // Updated to query.FormId

            if (jobStartForm == null)
            {
                return null; // Or throw NotFoundException
            }

            // Map entity to DTO, including selections
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
                Selections = jobStartForm.Selections.Select(s => new JobStartFormSelectionDto
                {
                    SelectionId = s.SelectionId,
                    FormId = s.FormId,
                    OptionCategory = s.OptionCategory,
                    OptionName = s.OptionName,
                    IsSelected = s.IsSelected,
                    Notes = s.Notes
                }).ToList()
            };
        }
    }
}
