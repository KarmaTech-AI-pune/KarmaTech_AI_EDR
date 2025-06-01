using MediatR;
using NJS.Application.CQRS.JobStartForm.Commands;
using NJS.Domain.UnitWork;

namespace NJS.Application.CQRS.JobStartForm.Handlers
{
    public class AddJobStartFormCommandHandler : IRequestHandler<AddJobStartFormCommand, int>
    {
        private readonly IUnitOfWork _unitOfWork;

        public AddJobStartFormCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<int> Handle(AddJobStartFormCommand command, CancellationToken cancellationToken)
        {
            var jobStartForm = new NJS.Domain.Entities.JobStartForm 
            {
                ProjectId = command.JobStartFormDto.ProjectId,
                WorkBreakdownStructureId = command.JobStartFormDto.WorkBreakdownStructureId,
                FormTitle = command.JobStartFormDto.FormTitle,
                Description = command.JobStartFormDto.Description,
                StartDate = command.JobStartFormDto.StartDate,
                PreparedBy = command.JobStartFormDto.PreparedBy
            };

            await _unitOfWork.GetRepository<NJS.Domain.Entities.JobStartForm>().AddAsync(jobStartForm); // Use generic repository
            await _unitOfWork.SaveChangesAsync();
            return jobStartForm.FormId; 
        }
    }
}
