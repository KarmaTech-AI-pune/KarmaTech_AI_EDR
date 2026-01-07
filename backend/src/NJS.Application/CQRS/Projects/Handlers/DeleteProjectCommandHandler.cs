﻿﻿using MediatR;
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

            if (request.ProgramId.HasValue)
            {
                var existingProject = _repository.GetById(request.Id);
                if (existingProject != null && existingProject.ProgramId != request.ProgramId.Value)
                {
                    throw new ArgumentException($"Project with ID {request.Id} does not belong to Program {request.ProgramId.Value}");
                }
            }

            try
            {
                // We don't need to check if the project exists first
                // The repository will handle the case when the project doesn't exist
                _repository.Delete(request.Id);
                return Unit.Value;
            }
            catch (Exception ex)
            {
                throw new ApplicationException($"Error deleting project with ID {request.Id}", ex);
            }
        }
    }
}
