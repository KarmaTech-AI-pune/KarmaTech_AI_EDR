using MediatR;
using EDR.Application.CQRS.Correspondence.Commands;
using EDR.Application.DTOs;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Correspondence.Handlers
{
    public class CreateCorrespondenceOutwardCommandHandler : IRequestHandler<CreateCorrespondenceOutwardCommand, CorrespondenceOutwardDto>
    {
        private readonly ICorrespondenceOutwardRepository _repository;

        public CreateCorrespondenceOutwardCommandHandler(ICorrespondenceOutwardRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<CorrespondenceOutwardDto> Handle(CreateCorrespondenceOutwardCommand request, CancellationToken cancellationToken)
        {
            var correspondenceOutward = new CorrespondenceOutward
            {
                ProjectId = request.ProjectId,
                LetterNo = request.LetterNo,
                LetterDate = request.LetterDate,
                To = request.To,
                Subject = request.Subject,
                AttachmentDetails = request.AttachmentDetails,
                ActionTaken = request.ActionTaken,
                StoragePath = request.StoragePath,
                Remarks = request.Remarks,
                Acknowledgement = request.Acknowledgement,
                CreatedBy = request.CreatedBy,
                CreatedAt = DateTime.UtcNow
            };

            var id = await _repository.AddAsync(correspondenceOutward);
            correspondenceOutward.Id = id;

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
                CreatedAt = correspondenceOutward.CreatedAt
            };
        }
    }
}

