using MediatR;
using EDR.Application.CQRS.Correspondence.Queries;
using EDR.Application.DTOs;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Correspondence.Handlers
{
    public class GetCorrespondenceOutwardByIdQueryHandler : IRequestHandler<GetCorrespondenceOutwardByIdQuery, CorrespondenceOutwardDto>
    {
        private readonly ICorrespondenceOutwardRepository _repository;

        public GetCorrespondenceOutwardByIdQueryHandler(ICorrespondenceOutwardRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<CorrespondenceOutwardDto> Handle(GetCorrespondenceOutwardByIdQuery request, CancellationToken cancellationToken)
        {
            var correspondenceOutward = await _repository.GetByIdAsync(request.Id);
            if (correspondenceOutward == null)
            {
                return null;
            }

            return new CorrespondenceOutwardDto
            {
                Id = correspondenceOutward.Id,
                ProjectId = correspondenceOutward.ProjectId,
                LetterNo = correspondenceOutward.LetterNo,
                LetterDate = correspondenceOutward.LetterDate,
                To = correspondenceOutward.To,
                Subject = correspondenceOutward.Subject,
                AttachmentDetails = correspondenceOutward.AttachmentDetails,
                ActionTaken = correspondenceOutward.ActionTaken,
                StoragePath = correspondenceOutward.StoragePath,
                Remarks = correspondenceOutward.Remarks,
                Acknowledgement = correspondenceOutward.Acknowledgement,
                CreatedBy = correspondenceOutward.CreatedBy,
                CreatedAt = correspondenceOutward.CreatedAt,
                UpdatedBy = correspondenceOutward.UpdatedBy,
                UpdatedAt = correspondenceOutward.UpdatedAt
            };
        }
    }
}

