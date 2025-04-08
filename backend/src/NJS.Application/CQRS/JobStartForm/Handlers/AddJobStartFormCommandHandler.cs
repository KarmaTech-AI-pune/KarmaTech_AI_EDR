using MediatR;
using NJS.Application.CQRS.JobStartForm.Commands;
using System.Threading;
using System.Threading.Tasks;
using NJS.Domain.Entities;
using NJS.Domain.UnitWork;
using NJS.Domain.Entities; // Add missing using

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
            var jobStartForm = new NJS.Domain.Entities.JobStartForm // Use fully qualified name initially
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
            return jobStartForm.FormId; // Use correct primary key 'FormId'
        }
    }
}
