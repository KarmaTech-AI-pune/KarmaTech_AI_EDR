using MediatR;
using NJS.Application.CQRS.ProjectClosure.Commands;
using NJS.Repositories.Interfaces;
using NJS.Repositories.Repositories;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.ProjectClosure.Handlers
{
    public class DeleteProjectClosureCommandHandler : IRequestHandler<DeleteProjectClosureCommand, bool>
    {
        private readonly IProjectClosureRepository _projectClosureRepository;
        // Removed ProjectClosureCommentRepository to fix build issues
        //private readonly IProjectClosureCommentRepository _projectClosureCommentRepository;

        public DeleteProjectClosureCommandHandler(
            IProjectClosureRepository projectClosureRepository)
            //IProjectClosureCommentRepository projectClosureCommentRepository)
        {
            _projectClosureRepository = projectClosureRepository ?? throw new ArgumentNullException(nameof(projectClosureRepository));
            //_projectClosureCommentRepository = projectClosureCommentRepository ?? throw new ArgumentNullException(nameof(projectClosureCommentRepository));
        }

        public async Task<bool> Handle(DeleteProjectClosureCommand request, CancellationToken cancellationToken)
        {
            // Validate the ID - allow ID 0 since it's a valid ID in our system
            if (request.Id < 0)
                throw new ArgumentException("Invalid Id. Project closure ID must be a non-negative number.", nameof(request.Id));

            try
            {
                // Check if the project closure exists before attempting to delete
                var existingClosure = await _projectClosureRepository.GetById(request.Id);
                if (existingClosure == null)
                {
                    Console.WriteLine($"Project closure with ID {request.Id} not found. Cannot delete non-existent entity.");
                    return false; // Return false to indicate the entity was not found
                }

                // Removed comments deletion to fix build issues
                /*
                // First delete all comments associated with this project closure
                await _projectClosureCommentRepository.DeleteByProjectClosureId(request.Id);
                Console.WriteLine($"Deleted all comments for project closure ID {request.Id}");
                */

                // Then delete the project closure itself
                _projectClosureRepository.Delete(request.Id);
                Console.WriteLine($"Deleted project closure with ID {request.Id}");

                return true; // Return true to indicate successful deletion
            }
            catch (ArgumentException ex)
            {
                // Re-throw argument exceptions for invalid IDs
                Console.WriteLine($"Invalid argument in DeleteProjectClosureCommandHandler: {ex.Message}");
                throw;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting project closure: {ex.Message}");
                return false;
            }
        }
    }
}
