using MediatR;
using NJS.Application.CQRS.JobStartForm.Commands;
using NJS.Domain.UnitWork;

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
            var jobStartForm = await _unitOfWork.GetRepository<NJS.Domain.Entities.JobStartForm>().GetByIdAsync(command.Id);
            if (jobStartForm != null)
            {
                await _unitOfWork.GetRepository<NJS.Domain.Entities.JobStartForm>().RemoveAsync(jobStartForm);
                await _unitOfWork.SaveChangesAsync();
            }
        }
    }
}
