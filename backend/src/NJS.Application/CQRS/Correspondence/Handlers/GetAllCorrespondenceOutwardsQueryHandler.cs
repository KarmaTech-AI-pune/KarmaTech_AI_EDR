using MediatR;
using NJS.Application.CQRS.Correspondence.Queries;
using NJS.Application.DTOs;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Correspondence.Handlers
{
    public class GetAllCorrespondenceOutwardsQueryHandler : IRequestHandler<GetAllCorrespondenceOutwardsQuery, IEnumerable<CorrespondenceOutwardDto>>
    {
        private readonly ICorrespondenceOutwardRepository _repository;

        public GetAllCorrespondenceOutwardsQueryHandler(ICorrespondenceOutwardRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<IEnumerable<CorrespondenceOutwardDto>> Handle(GetAllCorrespondenceOutwardsQuery request, CancellationToken cancellationToken)
        {
            var correspondenceOutwards = await _repository.GetAllAsync();
            
            return correspondenceOutwards.Select(co => new CorrespondenceOutwardDto
            {
                Id = co.Id,
                ProjectId = co.ProjectId,
                LetterNo = co.LetterNo,
                LetterDate = co.LetterDate,
                To = co.To,
                Subject = co.Subject,
                AttachmentDetails = co.AttachmentDetails,
                ActionTaken = co.ActionTaken,
                StoragePath = co.StoragePath,
                Remarks = co.Remarks,
                Acknowledgement = co.Acknowledgement,
                CreatedBy = co.CreatedBy,
                CreatedAt = co.CreatedAt,
                UpdatedBy = co.UpdatedBy,
                UpdatedAt = co.UpdatedAt
            });
        }
    }
}
