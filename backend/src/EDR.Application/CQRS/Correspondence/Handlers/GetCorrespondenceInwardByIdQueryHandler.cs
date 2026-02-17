using MediatR;
using EDR.Application.CQRS.Correspondence.Queries;
using EDR.Application.DTOs;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Correspondence.Handlers
{
    public class GetCorrespondenceInwardByIdQueryHandler : IRequestHandler<GetCorrespondenceInwardByIdQuery, CorrespondenceInwardDto>
    {
        private readonly ICorrespondenceInwardRepository _repository;

        public GetCorrespondenceInwardByIdQueryHandler(ICorrespondenceInwardRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<CorrespondenceInwardDto> Handle(GetCorrespondenceInwardByIdQuery request, CancellationToken cancellationToken)
        {
            var correspondenceInward = await _repository.GetByIdAsync(request.Id);
            if (correspondenceInward == null)
            {
                return null;
            }

            return new CorrespondenceInwardDto
            {
                Id = correspondenceInward.Id,
                ProjectId = correspondenceInward.ProjectId,
                IncomingLetterNo = correspondenceInward.IncomingLetterNo,
                LetterDate = correspondenceInward.LetterDate,
                NjsInwardNo = correspondenceInward.NjsInwardNo,
                ReceiptDate = correspondenceInward.ReceiptDate,
                From = correspondenceInward.From,
                Subject = correspondenceInward.Subject,
                AttachmentDetails = correspondenceInward.AttachmentDetails,
                ActionTaken = correspondenceInward.ActionTaken,
                StoragePath = correspondenceInward.StoragePath,
                Remarks = correspondenceInward.Remarks,
                RepliedDate = correspondenceInward.RepliedDate,
                CreatedBy = correspondenceInward.CreatedBy,
                CreatedAt = correspondenceInward.CreatedAt,
                UpdatedBy = correspondenceInward.UpdatedBy,
                UpdatedAt = correspondenceInward.UpdatedAt
            };
        }
    }
}

