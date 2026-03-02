using MediatR;
using EDR.Application.CQRS.Projects.Queries;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Projects.Handlers
{
    public class GetProjectByUserIdQueryHandler : IRequestHandler<GetProjectByUserIdQuery, IEnumerable<Project>>
    {
        private readonly IProjectRepository _repository;

        public GetProjectByUserIdQueryHandler(IProjectRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<IEnumerable<Project>> Handle(GetProjectByUserIdQuery request, CancellationToken cancellationToken)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var projects = await _repository.GetAllByUserId(request.UserId).ConfigureAwait(false);
            if (projects == null)
                throw new ArgumentException($"Project with ID {request.UserId} not found");

            return projects!;
        }
    }
}

