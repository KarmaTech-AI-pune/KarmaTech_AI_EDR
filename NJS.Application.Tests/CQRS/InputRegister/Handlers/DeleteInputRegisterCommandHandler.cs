using MediatR;
using NJS.Application.Tests.CQRS.InputRegister.Commands;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.Tests.CQRS.InputRegister.Handlers
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
            if (request == null)
                throw new ArgumentNullException(nameof(request));

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
