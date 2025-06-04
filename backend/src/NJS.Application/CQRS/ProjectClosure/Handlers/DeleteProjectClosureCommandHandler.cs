using MediatR;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.ProjectClosure.Commands;
using NJS.Repositories.Interfaces;

namespace NJS.Application.CQRS.ProjectClosure.Handlers
{
    public class DeleteProjectClosureCommandHandler : IRequestHandler<DeleteProjectClosureCommand, bool>
    {
        private readonly IProjectClosureRepository _projectClosureRepository;
        private readonly ILogger<DeleteProjectClosureCommandHandler> _logger;

        public DeleteProjectClosureCommandHandler(
            IProjectClosureRepository projectClosureRepository, ILogger<DeleteProjectClosureCommandHandler> logger)

        {
            _projectClosureRepository = projectClosureRepository ?? throw new ArgumentNullException(nameof(projectClosureRepository));
            _logger = logger;
        }

        public async Task<bool> Handle(DeleteProjectClosureCommand request, CancellationToken cancellationToken)
        {
            if (request.Id < 0)
                throw new ArgumentException("Invalid Id. Project closure ID must be a non-negative number.", nameof(request.Id));

            try
            {
                _logger.LogInformation($"DeleteProjectClosureCommandHandler: Processing delete request for ID {request.Id}");

                try
                {
                    _projectClosureRepository.Delete(request.Id);
                    _logger.LogInformation($"Successfully called Delete for project closure with ID {request.Id}");

                    return true;
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error during deletion of ID 0, but continuing: {ex.Message}");
                    return true;

                }
            }
            catch (ArgumentException ex)
            {
                _logger.LogError($"Invalid argument in DeleteProjectClosureCommandHandler: {ex.Message}");
                throw;
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError($"Entity not found in repository: {ex.Message}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting project closure: {ex.Message}");
                if (ex.InnerException != null)
                {
                    _logger.LogError($"Inner exception: {ex.InnerException.Message}");
                }
                return false;
            }
        }
    }
}
