using MediatR;
using NJS.Application.CQRS.JobStartForm.Commands;
using System.Threading;
using System.Threading.Tasks;
using NJS.Domain.UnitWork;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.JobStartForm.Handlers
{
    public class DeleteJobStartFormCommandHandler : IRequestHandler<DeleteJobStartFormCommand>
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteJobStartFormCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task Handle(DeleteJobStartFormCommand command, CancellationToken cancellationToken)
        {
            // Assuming command uses 'Id' based on common convention and previous errors
            var jobStartForm = await _unitOfWork.GetRepository<NJS.Domain.Entities.JobStartForm>().GetByIdAsync(command.Id);
            if (jobStartForm != null)
            {
                // Use the correct RemoveAsync method from IRepository
                await _unitOfWork.GetRepository<NJS.Domain.Entities.JobStartForm>().RemoveAsync(jobStartForm);
                await _unitOfWork.SaveChangesAsync();
            }
            // Optionally handle the case where the form is not found
        }
    }
}
