﻿using MediatR;
using NJS.Application.CQRS.Projects.Commands;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Projects.Handlers
{
    public class DeleteProjectCommandHandler : IRequestHandler<DeleteProjectCommand, Unit>
    {
        private readonly IProjectRepository _repository;

        public DeleteProjectCommandHandler(IProjectRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<Unit> Handle(DeleteProjectCommand request, CancellationToken cancellationToken)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            try
            {
                // The repository will handle the deletion. Since it returns void, we just call it.
                _repository.Delete(request.Id);
                // The repository handles the case where the project doesn't exist.
                // We return Unit.Value to indicate that the operation completed.
                return Unit.Value;
            }
            catch (Exception ex)
            {
                throw new ApplicationException($"Error deleting project with ID {request.Id}", ex);
            }
        }
    }
}
