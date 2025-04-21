using MediatR;
using NJS.Application.CQRS.Correspondence.Commands;
using NJS.Application.DTOs;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Correspondence.Handlers
{
    public class UpdateCorrespondenceOutwardCommandHandler : IRequestHandler<UpdateCorrespondenceOutwardCommand, CorrespondenceOutwardDto>
    {
        private readonly ICorrespondenceOutwardRepository _repository;

        public UpdateCorrespondenceOutwardCommandHandler(ICorrespondenceOutwardRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<CorrespondenceOutwardDto> Handle(UpdateCorrespondenceOutwardCommand request, CancellationToken cancellationToken)
        {
            var correspondenceOutward = await _repository.GetByIdAsync(request.Id);
            if (correspondenceOutward == null)
            {
                throw new Exception($"Correspondence Outward with ID {request.Id} not found.");
            }

            correspondenceOutward.ProjectId = request.ProjectId;
            correspondenceOutward.LetterNo = request.LetterNo;
            correspondenceOutward.LetterDate = request.LetterDate;
            correspondenceOutward.To = request.To;
            correspondenceOutward.Subject = request.Subject;
            correspondenceOutward.AttachmentDetails = request.AttachmentDetails;
            correspondenceOutward.ActionTaken = request.ActionTaken;
            correspondenceOutward.StoragePath = request.StoragePath;
            correspondenceOutward.Remarks = request.Remarks;
            correspondenceOutward.Acknowledgement = request.Acknowledgement;
            correspondenceOutward.UpdatedBy = request.UpdatedBy;
            correspondenceOutward.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(correspondenceOutward);

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
