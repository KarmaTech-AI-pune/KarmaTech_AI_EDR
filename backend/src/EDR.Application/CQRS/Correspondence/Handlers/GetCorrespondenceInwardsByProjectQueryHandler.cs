using MediatR;
using EDR.Application.CQRS.Correspondence.Queries;
using EDR.Application.DTOs;
using EDR.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Correspondence.Handlers
{
    public class GetCorrespondenceInwardsByProjectQueryHandler : IRequestHandler<GetCorrespondenceInwardsByProjectQuery, IEnumerable<CorrespondenceInwardDto>>
    {
        private readonly ICorrespondenceInwardRepository _repository;

        public GetCorrespondenceInwardsByProjectQueryHandler(ICorrespondenceInwardRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<IEnumerable<CorrespondenceInwardDto>> Handle(GetCorrespondenceInwardsByProjectQuery request, CancellationToken cancellationToken)
        {
            var correspondenceInwards = await _repository.GetByProjectIdAsync(request.ProjectId);
            
            return correspondenceInwards.Select(ci => new CorrespondenceInwardDto
            {
                Id = ci.Id,
                ProjectId = ci.ProjectId,
                IncomingLetterNo = ci.IncomingLetterNo,
                LetterDate = ci.LetterDate,
                NjsInwardNo = ci.NjsInwardNo,
                ReceiptDate = ci.ReceiptDate,
                From = ci.From,
                Subject = ci.Subject,
                AttachmentDetails = ci.AttachmentDetails,
                ActionTaken = ci.ActionTaken,
                StoragePath = ci.StoragePath,
                Remarks = ci.Remarks,
                RepliedDate = ci.RepliedDate,
                CreatedBy = ci.CreatedBy,
                CreatedAt = ci.CreatedAt,
                UpdatedBy = ci.UpdatedBy,
                UpdatedAt = ci.UpdatedAt
            });
        }
    }
}

