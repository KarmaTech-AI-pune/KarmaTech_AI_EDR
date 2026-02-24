using MediatR;
using EDR.Application.CQRS.ChangeControl.Commands;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.ChangeControl.Handlers
{
    public class DeleteChangeControlCommandHandler : IRequestHandler<DeleteChangeControlCommand, Unit>
    {
        private readonly IChangeControlRepository _changeControlRepository;

        public DeleteChangeControlCommandHandler(IChangeControlRepository changeControlRepository)
        {
            _changeControlRepository = changeControlRepository ?? throw new ArgumentNullException(nameof(changeControlRepository));
        }

        public async Task<Unit> Handle(DeleteChangeControlCommand request, CancellationToken cancellationToken)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            await _changeControlRepository.DeleteAsync(request.Id);

            return Unit.Value;
        }
    }
}

