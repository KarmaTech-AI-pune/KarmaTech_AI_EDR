using MediatR;
using NJS.Application.CQRS.JobStartForm.Commands;
using System.Threading;
using System.Threading.Tasks;
using NJS.Domain.UnitWork;
using NJS.Domain.Entities;
using System; // Add missing using for DateTime

namespace NJS.Application.CQRS.JobStartForm.Handlers
{
    public class UpdateJobStartFormCommandHandler : IRequestHandler<UpdateJobStartFormCommand>
    {
        private readonly IUnitOfWork _unitOfWork;

        public UpdateJobStartFormCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task Handle(UpdateJobStartFormCommand command, CancellationToken cancellationToken)
        {
            // Assuming command.JobStartFormDto holds the updated data including the FormId
            var jobStartForm = await _unitOfWork.GetRepository<NJS.Domain.Entities.JobStartForm>().GetByIdAsync(command.JobStartFormDto.FormId);

            if (jobStartForm != null)
            {
                // Update properties based on JobStartFormDto
                jobStartForm.ProjectId = command.JobStartFormDto.ProjectId;
                jobStartForm.WorkBreakdownStructureId = command.JobStartFormDto.WorkBreakdownStructureId;
                jobStartForm.FormTitle = command.JobStartFormDto.FormTitle;
                jobStartForm.Description = command.JobStartFormDto.Description;
                jobStartForm.StartDate = command.JobStartFormDto.StartDate;
                jobStartForm.PreparedBy = command.JobStartFormDto.PreparedBy;
                jobStartForm.UpdatedDate = DateTime.UtcNow; // Use UpdatedDate field

                await _unitOfWork.GetRepository<NJS.Domain.Entities.JobStartForm>().UpdateAsync(jobStartForm); // Use generic repository
                await _unitOfWork.SaveChangesAsync();
            }
        }
    }
}
