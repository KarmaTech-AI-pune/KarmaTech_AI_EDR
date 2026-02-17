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
    public class CreateCorrespondenceInwardCommandHandler : IRequestHandler<CreateCorrespondenceInwardCommand, CorrespondenceInwardDto>
    {
        private readonly ICorrespondenceInwardRepository _repository;

        public CreateCorrespondenceInwardCommandHandler(ICorrespondenceInwardRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<CorrespondenceInwardDto> Handle(CreateCorrespondenceInwardCommand request, CancellationToken cancellationToken)
        {
            var correspondenceInward = new CorrespondenceInward
            {
                ProjectId = request.ProjectId,
                IncomingLetterNo = request.IncomingLetterNo,
                LetterDate = request.LetterDate,
                EdrInwardNo = request.EdrInwardNo,
                ReceiptDate = request.ReceiptDate,
                From = request.From,
                Subject = request.Subject,
                AttachmentDetails = request.AttachmentDetails,
                ActionTaken = request.ActionTaken,
                StoragePath = request.StoragePath,
                Remarks = request.Remarks,
                RepliedDate = request.RepliedDate,
                CreatedBy = request.CreatedBy,
                CreatedAt = DateTime.UtcNow
            };

            var id = await _repository.AddAsync(correspondenceInward);
            correspondenceInward.Id = id;

            return new CorrespondenceInwardDto
            {
                Id = correspondenceInward.Id,
                ProjectId = correspondenceInward.ProjectId,
                IncomingLetterNo = correspondenceInward.IncomingLetterNo,
                LetterDate = correspondenceInward.LetterDate,
                EdrInwardNo = correspondenceInward.EdrInwardNo,
                ReceiptDate = correspondenceInward.ReceiptDate,
                From = correspondenceInward.From,
                Subject = correspondenceInward.Subject,
                AttachmentDetails = correspondenceInward.AttachmentDetails,
                ActionTaken = correspondenceInward.ActionTaken,
                StoragePath = correspondenceInward.StoragePath,
                Remarks = correspondenceInward.Remarks,
                RepliedDate = correspondenceInward.RepliedDate,
                CreatedBy = correspondenceInward.CreatedBy,
                CreatedAt = correspondenceInward.CreatedAt
            };
        }
    }
}


