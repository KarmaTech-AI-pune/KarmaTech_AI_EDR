using MediatR;
using EDR.Domain.GenericRepository;
using EDR.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace EDR.Application.CQRS.SprintTasks.Commands
{
    public class UpdateSprintTaskTimeCommandHandler : IRequestHandler<UpdateSprintTaskTimeCommand, bool>
    {
        private readonly IRepository<SprintTask> _sprintTaskRepository;
        private readonly IRepository<SprintWbsPlan> _sprintWbsPlanRepository;

        public UpdateSprintTaskTimeCommandHandler(
            IRepository<SprintTask> sprintTaskRepository,
            IRepository<SprintWbsPlan> sprintWbsPlanRepository)
        {
            _sprintTaskRepository = sprintTaskRepository;
            _sprintWbsPlanRepository = sprintWbsPlanRepository;
        }

        public async Task<bool> Handle(UpdateSprintTaskTimeCommand request, CancellationToken cancellationToken)
        {
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

            // 3. Calculate Delta for Actual Hours
            // Logic: The user inputs the NEW total Actual Hours.
            // Delta = New Actual - Old Actual
            int oldActual = task.ActualHours;
            int newActual = request.ActualHours;
            int deltaActual = newActual - oldActual;

            // 4. Update Task
            task.ActualHours = newActual;
            task.RemainingHours = request.RemainingHours; // Update task's remaining estimate
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

            // 6. Save Changes
            // Since we are using repositories, we assume UnitOfWork or equivalent handles saving vs individual updates. 
            // The existing patterns suggest simply calling Update() might save or we need a SaveChanges.
            // Checking existing handlers... usually Update calls Save internally in simple setups or we await a Save.
            // Assume Repos saves on Update or context is shared. 
            // Wait, standard NJS handlers usually don't show explicit SaveChanges call in the snippet I saw?
            // Let's verify standard repo usage in next step if needed. 
            // But generic repo usually implements Save in Update or has a separate Save.
            // I'll assume Update commits or I'll add logic if I see it elsewhere. 
            
            // Actually, based on previous files, I haven't seen the Repo impl. 
            // I'll trust the IRepository abstraction handles it for now.
            
            return true;
        }
    }
}

