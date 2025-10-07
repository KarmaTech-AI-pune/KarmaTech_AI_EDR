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
                // The repository will handle the case when the project doesn't exist and return false
                var isDeleted = await _repository.Delete(request.Id).ConfigureAwait(false);
                // If isDeleted is false, it means the project was not found, and the repository handled it gracefully.
                // In this case, we still return Unit.Value to indicate that from the command's perspective,
                // the operation completed without needing to report a "not found" error up the chain.
                return Unit.Value;
            }
            catch (Exception ex)
            {
                throw new ApplicationException($"Error deleting project with ID {request.Id}", ex);
            }
        }
    }
}
