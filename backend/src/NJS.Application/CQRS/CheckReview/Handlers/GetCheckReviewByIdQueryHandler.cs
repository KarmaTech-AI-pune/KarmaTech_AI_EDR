using MediatR;
using NJS.Application.CQRS.CheckReview.Queries;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.CheckReview.Handlers
{
    public class GetCheckReviewByIdQueryHandler : IRequestHandler<GetCheckReviewByIdQuery, CheckReviewDto>
    {
        private readonly ICheckReviewRepository _repository;

        public GetCheckReviewByIdQueryHandler(ICheckReviewRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<CheckReviewDto> Handle(GetCheckReviewByIdQuery request, CancellationToken cancellationToken)
        {
            var entity = await _repository.GetByIdAsync(request.Id);
            if (entity == null)
            {
                return null;
            }

            return new CheckReviewDto
            {
                Id = entity.Id,
                ProjectId = entity.ProjectId,
                ActivityNo = entity.ActivityNo,
                ActivityName = entity.ActivityName,
                Objective = entity.Objective,
                References = entity.References,
                FileName = entity.FileName,
                QualityIssues = entity.QualityIssues,
                Completion = entity.Completion,
                CheckedBy = entity.CheckedBy,
                ApprovedBy = entity.ApprovedBy,
                ActionTaken = entity.ActionTaken,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt,
                CreatedBy = entity.CreatedBy,
                UpdatedBy = entity.UpdatedBy
            };
        }
    }
}
