using MediatR;
using EDR.Application.CQRS.InputRegister.Commands;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.InputRegister.Handlers
{
    public class DeleteInputRegisterCommandHandler : IRequestHandler<DeleteInputRegisterCommand, bool>
    {
        private readonly IInputRegisterRepository _repository;

        public DeleteInputRegisterCommandHandler(IInputRegisterRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<bool> Handle(DeleteInputRegisterCommand request, CancellationToken cancellationToken)
        {
            var exists = await _repository.ExistsAsync(request.Id);
            if (!exists)
            {
                return false;
            }

            await _repository.DeleteAsync(request.Id);

            // Reset the identity seed to ensure new entries start from the lowest available ID
            await _repository.ResetIdentitySeedAsync();

            return true;
        }
    }
}

