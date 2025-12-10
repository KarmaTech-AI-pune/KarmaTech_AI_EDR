using FluentValidation;
using NJS.Application.CQRS.Projects.Commands;
using NJS.Repositories.Interfaces;

namespace NJS.Application.CQRS.Projects.Validators
{
    public class UpdateProjectBudgetCommandValidator : AbstractValidator<UpdateProjectBudgetCommand>
    {
        private readonly IProjectRepository _projectRepository;

        public UpdateProjectBudgetCommandValidator(IProjectRepository projectRepository)
        {
            _projectRepository = projectRepository;

            RuleFor(x => x.ProjectId)
                .GreaterThan(0)
                .WithMessage("ProjectId must be greater than 0")
                .MustAsync(ProjectExists)
                .WithMessage("Project with the specified ID does not exist");

            RuleFor(x => x)
                .Must(HaveAtLeastOneBudgetField)
                .WithMessage("At least one budget field (EstimatedProjectCost or EstimatedProjectFee) must be provided");

            RuleFor(x => x.EstimatedProjectCost)
                .GreaterThanOrEqualTo(0)
                .When(x => x.EstimatedProjectCost.HasValue)
                .WithMessage("EstimatedProjectCost must be greater than or equal to 0");

            RuleFor(x => x.EstimatedProjectFee)
                .GreaterThanOrEqualTo(0)
                .When(x => x.EstimatedProjectFee.HasValue)
                .WithMessage("EstimatedProjectFee must be greater than or equal to 0");

            RuleFor(x => x.Reason)
                .MaximumLength(500)
                .When(x => !string.IsNullOrEmpty(x.Reason))
                .WithMessage("Reason cannot exceed 500 characters");

            RuleFor(x => x.ChangedBy)
                .NotEmpty()
                .WithMessage("ChangedBy is required")
                .MaximumLength(450)
                .WithMessage("ChangedBy cannot exceed 450 characters");

            RuleFor(x => x)
                .MustAsync(HaveDifferentValues)
                .WithMessage("New values must be different from current values");
        }

        private bool HaveAtLeastOneBudgetField(UpdateProjectBudgetCommand command)
        {
            return command.EstimatedProjectCost.HasValue || command.EstimatedProjectFee.HasValue;
        }

        private async Task<bool> ProjectExists(int projectId, CancellationToken cancellationToken)
        {
            try
            {
                var project = _projectRepository.GetById(projectId);
                return project != null;
            }
            catch
            {
                return false;
            }
        }

        private async Task<bool> HaveDifferentValues(UpdateProjectBudgetCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var existingProject = _projectRepository.GetById(command.ProjectId);
                if (existingProject == null)
                    return false; // This will be caught by the ProjectExists validation

                bool hasDifferences = false;

                if (command.EstimatedProjectCost.HasValue)
                {
                    hasDifferences |= command.EstimatedProjectCost.Value != existingProject.EstimatedProjectCost;
                }

                if (command.EstimatedProjectFee.HasValue)
                {
                    hasDifferences |= command.EstimatedProjectFee.Value != existingProject.EstimatedProjectFee;
                }

                return hasDifferences;
            }
            catch
            {
                return false;
            }
        }
    }
}