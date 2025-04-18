﻿﻿using MediatR;
using NJS.Application.CQRS.Projects.Commands;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Projects.Handlers
{
    public class DeleteProjectCommandHandler : IRequestHandler<DeleteProjectCommand, bool>
    {
        private readonly IProjectRepository _repository;

        public DeleteProjectCommandHandler(IProjectRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<bool> Handle(DeleteProjectCommand request, CancellationToken cancellationToken)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            try
            {
                // First check if the project exists
                bool exists = await _repository.ExistsAsync(request.Id);
                if (!exists)
                {
                    // Project doesn't exist, return false
                    Console.WriteLine($"Project with ID {request.Id} not found, cannot delete");
                    return false;
                }

                // Project exists, try to delete it
                bool deleted = _repository.Delete(request.Id);
                return deleted;
            }
            catch (Exception ex)
            {
                throw new ApplicationException($"Error deleting project with ID {request.Id}", ex);
            }
        }
    }
}
