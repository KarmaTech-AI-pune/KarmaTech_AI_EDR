using MediatR;
using NJS.Application.CQRS.ChangeControl.Commands;
using NJS.Application.Services.IContract;
using NJS.Domain.Enums;
using NJS.Repositories.Interfaces;

namespace NJS.Application.CQRS.ChangeControl.Handlers
{
    public class CreateChangeControlCommandHandler : IRequestHandler<CreateChangeControlCommand, int>
    {
        private readonly IChangeControlRepository _changeControlRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly ICurrentUserService _currentUserService;

        public CreateChangeControlCommandHandler(IChangeControlRepository changeControlRepository, IProjectRepository projectRepository, ICurrentUserService currentUserService)
        {
            _changeControlRepository = changeControlRepository ?? throw new ArgumentNullException(nameof(changeControlRepository));
            _projectRepository = projectRepository;
            _currentUserService = currentUserService;
        }

        public async Task<int> Handle(CreateChangeControlCommand request, CancellationToken cancellationToken)
        {
            if (request == null || request.ChangeControlDto == null)
                throw new ArgumentNullException(nameof(request));

            // Ensure all string fields have values and set audit fields
            var project = _projectRepository.GetById(request.ChangeControlDto.ProjectId);
            
            if (project == null)
            {
                 throw new KeyNotFoundException($"Project with ID {request.ChangeControlDto.ProjectId} not found.");
            }

            var dateNow= DateTime.UtcNow;

            var entity = new NJS.Domain.Entities.ChangeControl();
            var histories = new List<Domain.Entities.ChangeControlWorkflowHistory>();

            entity.ProjectId = request.ChangeControlDto.ProjectId;
            entity.SrNo = request.ChangeControlDto.SrNo;
            entity.DateLogged = request.ChangeControlDto.DateLogged;
            entity.Originator = request.ChangeControlDto.Originator;
            entity.Description = request.ChangeControlDto.Description;
            entity.CostImpact = request.ChangeControlDto.CostImpact ?? string.Empty;
            entity.TimeImpact = request.ChangeControlDto.TimeImpact ?? string.Empty;
            entity.ResourcesImpact = request.ChangeControlDto.ResourcesImpact ?? string.Empty;
            entity.QualityImpact = request.ChangeControlDto.QualityImpact ?? string.Empty;
            entity.ChangeOrderStatus = request.ChangeControlDto.ChangeOrderStatus ?? string.Empty;
            entity.ClientApprovalStatus = request.ChangeControlDto.ClientApprovalStatus ?? string.Empty;
            entity.ClaimSituation = request.ChangeControlDto.ClaimSituation ?? string.Empty;

            entity.CreatedBy = string.IsNullOrEmpty(request.ChangeControlDto.CreatedBy) ? "System" : request.ChangeControlDto.CreatedBy;
            entity.CreatedAt = dateNow;
            entity.UpdatedBy = string.IsNullOrEmpty(request.ChangeControlDto.UpdatedBy) ? "System" : request.ChangeControlDto.UpdatedBy;
            entity.UpdatedAt = dateNow;

            if(project.ProjectManagerId is not null)
            {
                histories.Add(new Domain.Entities.ChangeControlWorkflowHistory()
                {
                    Action = "Initial",
                    Comments="Submitted",
                    StatusId = (int)PMWorkflowStatusEnum.Initial,
                    ActionDate = dateNow,
                    AssignedToId = project.ProjectManagerId,
                    ChangeControlId = entity.Id,
                    ActionBy = _currentUserService.UserId
                });
               
            }
            if (project.SeniorProjectManagerId is not null)
            {
                histories.Add(new Domain.Entities.ChangeControlWorkflowHistory()
                {
                    Action = "Initial",
                    Comments = "Submitted",
                    StatusId = (int)PMWorkflowStatusEnum.Initial,
                    ActionDate = dateNow,
                    AssignedToId = project.SeniorProjectManagerId,
                    ChangeControlId = entity.Id,
                    ActionBy = _currentUserService.UserId
                });

            }
            if (project.RegionalManagerId is not null)
            {
                histories.Add(new Domain.Entities.ChangeControlWorkflowHistory()
                {
                    Action = "Initial",
                    Comments = "Submitted",
                    StatusId = (int)PMWorkflowStatusEnum.Initial,
                    ActionDate = dateNow,
                    AssignedToId = project.RegionalManagerId,
                    ChangeControlId = entity.Id,
                    ActionBy = _currentUserService.UserId
                });

            }
            entity.WorkflowHistories = histories;
            return await _changeControlRepository.AddAsync(entity);
        }
    }
}
