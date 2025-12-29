using MediatR;
using NJS.Application.CQRS.Projects.Queries;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Projects.Handlers
{
    public class GetProjectByIdQueryHandler : IRequestHandler<GetProjectByIdQuery, Project>
    {
        private readonly IProjectRepository _repository;

        public GetProjectByIdQueryHandler(IProjectRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public Task<Project> Handle(GetProjectByIdQuery request, CancellationToken cancellationToken)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var project = _repository.GetById(request.Id);
            if (project == null)
                throw new ArgumentException($"Project with ID {request.Id} not found");

            if (request.ProgramId.HasValue && project.ProgramId != request.ProgramId.Value)
            {
                throw new ArgumentException($"Project with ID {request.Id} does not belong to Program {request.ProgramId.Value}"); 
            }

            return Task.FromResult(project);
        }
    }
}
