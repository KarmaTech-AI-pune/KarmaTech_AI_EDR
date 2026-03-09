using MediatR;
using EDR.Domain.GenericRepository;
using EDR.Domain.Entities;using System.Threading;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace EDR.Application.CQRS.SprintTasks.Commands{
    public class UpdateSprintTaskTimeCommandHandler : IRequestHandler<UpdateSprintTaskTimeCommand, bool>
    {
        private readonly IRepository<SprintTask> _sprintTaskRepository;
        private readonly IRepository<SprintWbsPlan> _sprintWbsPlanRepository;
        private readonly EDR.Application.Services.IContract.ICurrentUserService _currentUserService;

        public UpdateSprintTaskTimeCommandHandler(
            IRepository<SprintTask> sprintTaskRepository,
            IRepository<SprintWbsPlan> sprintWbsPlanRepository,
            EDR.Application.Services.IContract.ICurrentUserService currentUserService)
        {
            _sprintTaskRepository = sprintTaskRepository;
            _sprintWbsPlanRepository = sprintWbsPlanRepository;
            _currentUserService = currentUserService;
        }

        public async Task<bool> Handle(UpdateSprintTaskTimeCommand request, CancellationToken cancellationToken)
        {
            // If the user is NOT an approver, we skip updating the task-level data
            // (ActualHours, RemainingHours) and SprintWbsPlan. 
            // The frontend already created the SprintTaskComment history independently.
            if (!_currentUserService.IsInRole("WorkApprover"))
            {
                return true;
            }

            // 1. Fetch the SprintTask
            var task = await _sprintTaskRepository.GetByIdAsync(request.TaskId);
            if (task == null)
            {
                return false;
            }

            // 2. Fetch the SprintWbsPlan
            var plan = await _sprintWbsPlanRepository.GetByIdAsync(request.SprintWbsPlanId);
            if (plan == null)
            {
                 // Fallback: If passed ID is invalid but task has one, try that? 
                 // For now, adhere to strict request.
                return false;
            }

            // 3. Update Task Actual Hours (Cumulative)
            // request.ActualHours now represents the newly logged hours (the delta).
            int deltaActual = request.ActualHours;
            task.ActualHours += deltaActual;
            
            // Note: Optional, update task's remaining estimate if governed by approver
            task.RemainingHours = request.RemainingHours; 
            task.SprintWbsPlanId = request.SprintWbsPlanId; // Ensure link is correct
            
            await _sprintTaskRepository.UpdateAsync(task);

            // 5. Update SprintWbsPlan
            // Logic: If I worked 2 hours (delta +2), the remaining plan reduces by 2.
            // Plan Remaining = Plan Remaining - Delta
            // Note: SprintWbsPlan.RemainingHours is decimal, Task is int. Casting required.
            plan.RemainingHours -= (decimal)deltaActual;

            if (deltaActual > 0)
            {
                 plan.IsConsumed = true;
            }

            await _sprintWbsPlanRepository.UpdateAsync(plan);
            
            return true;
        }
    }
}



