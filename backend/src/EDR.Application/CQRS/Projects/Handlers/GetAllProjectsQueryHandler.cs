using MediatR;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.Projects.Queries;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Projects.Handlers
{
    public class GetAllProjectsQueryHandler : IRequestHandler<GetAllProjectsQuery, IEnumerable<Project>>
    {
        private readonly IProjectRepository _repository;
        private readonly ILogger<GetAllProjectsQueryHandler> _logger;

        public GetAllProjectsQueryHandler(
            IProjectRepository repository,
            ILogger<GetAllProjectsQueryHandler> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<Project>> Handle(GetAllProjectsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // If ProgramId is provided, filter by program
                if (request.ProgramId.HasValue)
                {
                    _logger.LogInformation("Retrieving projects for Program {ProgramId}", request.ProgramId.Value);
                    var programProjects = await _repository.GetAllByProgramId(request.ProgramId.Value);
                    
                    if (!programProjects.Any())
                    {
                        _logger.LogInformation("No projects found for Program {ProgramId}", request.ProgramId.Value);
                    }
                    
                    return programProjects;
                }
                
                // Otherwise, return all projects
                _logger.LogInformation("Retrieving all projects");
                return await _repository.GetAll();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving projects. ProgramId: {ProgramId}", request.ProgramId);
                throw new ApplicationException("Error retrieving projects", ex);
            }
        }
    }
}
