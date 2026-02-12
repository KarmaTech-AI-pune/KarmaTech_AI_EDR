using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.ChangeControl.Commands;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using NJS.Domain.GenericRepository;
using NJS.Repositories.Interfaces;

namespace NJS.Application.CQRS.ChangeControl.Handlers
{
    public class CreateChangeControlCommandHandler : IRequestHandler<CreateChangeControlCommand, int>
    {
        private readonly IChangeControlRepository _changeControlRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly ICurrentUserService _currentUserService;

        private readonly IRepository<User> _userRepository;

        public CreateChangeControlCommandHandler(IChangeControlRepository changeControlRepository, IProjectRepository projectRepository, ICurrentUserService currentUserService, IRepository<User> userRepository)
        {
            _changeControlRepository = changeControlRepository ?? throw new ArgumentNullException(nameof(changeControlRepository));
            _projectRepository = projectRepository;
            _currentUserService = currentUserService;
            _userRepository = userRepository;
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

            // JIT User Provisioning: Ensure the current user exists in the tenant database
            // This prevents Foreign Key violations in ChangeControlWorkflowHistory
            var currentUserId = _currentUserService.UserId;

            // JIT User Provisioning & ID Resolution
            // 1. Try to find user by Token ID
            var existingUser = await _userRepository.Query().FirstOrDefaultAsync(u => u.Id == currentUserId);
                
                if (existingUser != null)
                {
                    // User found by ID, use it
                    currentUserId = existingUser.Id;
                }
                else
                {
                    // 2. User not found by ID. Try to find by UserName (to avoid duplicates)
                    // Azure AD/External Auth might have a different ID than local DB
                    var currentUserName = _currentUserService.UserName;
                    if (!string.IsNullOrEmpty(currentUserName))
                    {
                        existingUser = await _userRepository.Query().FirstOrDefaultAsync(u => u.UserName == currentUserName);
                    }

                    if (existingUser != null)
                    {
                        // User found by Name! Use this existing Local ID for FKs
                        currentUserId = existingUser.Id;
                    }
                    else
                    {
                        // 3. User definitely doesn't exist. Provision new JIT user.
                        try 
                        {
                            var newUser = new User
                            {
                                Id = currentUserId, // Use Token ID for new user
                                UserName = _currentUserService.UserName ?? "Unknown",
                                NormalizedUserName = _currentUserService.UserName?.ToUpper() ?? "UNKNOWN",
                                Email = _currentUserService.UserName, 
                                NormalizedEmail = _currentUserService.UserName?.ToUpper(),
                                EmailConfirmed = true,
                                SecurityStamp = Guid.NewGuid().ToString(),
                                ConcurrencyStamp = Guid.NewGuid().ToString(), 
                                CreatedAt = DateTime.UtcNow,
                                Name = _currentUserService.UserName ?? "Tenant User",
                                TenantId = project.TenantId,
                                IsActive = true
                            };

                            await _userRepository.AddAsync(newUser);
                            await _userRepository.SaveChangesAsync();
                        }
                        catch (Exception ex)
                        {
                            // If we still hit a race condition or error, log it but don't crash if possible
                            // The subsequent SaveChanges might fail on FK if we didn't get a user, 
                            // but we'll let that happen naturally.
                             Console.WriteLine($"JIT PROVISIONING ERROR: {ex.Message}");
                        }
                    }
                }

            var entity = new NJS.Domain.Entities.ChangeControl();
            var histories = new List<Domain.Entities.ChangeControlWorkflowHistory>();

            entity.ProjectId = request.ChangeControlDto.ProjectId;
            entity.SrNo = request.ChangeControlDto.SrNo;
            entity.DateLogged = DateTime.SpecifyKind(request.ChangeControlDto.DateLogged, DateTimeKind.Utc);
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
                    ActionBy = currentUserId
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
                    ActionBy = currentUserId
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
                    ActionBy = currentUserId
                });

            }
            entity.WorkflowHistories = histories;
            return await _changeControlRepository.AddAsync(entity);
        }
    }
}
