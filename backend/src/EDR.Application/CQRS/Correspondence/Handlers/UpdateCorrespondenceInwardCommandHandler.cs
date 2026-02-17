using MediatR;
using EDR.Application.CQRS.Correspondence.Commands;
using EDR.Application.DTOs;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Correspondence.Handlers
{
    public class UpdateCorrespondenceInwardCommandHandler : IRequestHandler<UpdateCorrespondenceInwardCommand, CorrespondenceInwardDto>
    {
        private readonly ICorrespondenceInwardRepository _repository;

        public UpdateCorrespondenceInwardCommandHandler(ICorrespondenceInwardRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<CorrespondenceInwardDto> Handle(UpdateCorrespondenceInwardCommand request, CancellationToken cancellationToken)
        {
            var correspondenceInward = await _repository.GetByIdAsync(request.Id);
            if (correspondenceInward == null)
            {
                throw new Exception($"Correspondence Inward with ID {request.Id} not found.");
            }

            correspondenceInward.ProjectId = request.ProjectId;
            correspondenceInward.IncomingLetterNo = request.IncomingLetterNo;
            correspondenceInward.LetterDate = request.LetterDate;
            correspondenceInward.EdrInwardNo = request.EdrInwardNo;
            correspondenceInward.ReceiptDate = request.ReceiptDate;
            correspondenceInward.From = request.From;
            correspondenceInward.Subject = request.Subject;
            correspondenceInward.AttachmentDetails = request.AttachmentDetails;
            correspondenceInward.ActionTaken = request.ActionTaken;
            correspondenceInward.StoragePath = request.StoragePath;
            correspondenceInward.Remarks = request.Remarks;
            correspondenceInward.RepliedDate = request.RepliedDate;
            correspondenceInward.UpdatedBy = request.UpdatedBy;
            correspondenceInward.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(correspondenceInward);

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
                CreatedAt = correspondenceInward.CreatedAt,
                UpdatedBy = correspondenceInward.UpdatedBy,
                UpdatedAt = correspondenceInward.UpdatedAt
            };
        }
    }
}


