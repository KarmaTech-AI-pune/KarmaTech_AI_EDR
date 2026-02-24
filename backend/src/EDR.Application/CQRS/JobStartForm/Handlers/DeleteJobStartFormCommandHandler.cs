using MediatR;
using EDR.Application.CQRS.JobStartForm.Commands;
using EDR.Domain.UnitWork;

namespace EDR.Application.CQRS.JobStartForm.Handlers
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
            var jobStartForm = await _unitOfWork.GetRepository<EDR.Domain.Entities.JobStartForm>().GetByIdAsync(command.Id);
            if (jobStartForm != null)
            {
                await _unitOfWork.GetRepository<EDR.Domain.Entities.JobStartForm>().RemoveAsync(jobStartForm);
                await _unitOfWork.SaveChangesAsync();
            }
        }
    }
}

