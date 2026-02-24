using MediatR;
using EDR.Application.CQRS.WorkBreakdownStructures.Commands;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

using EDR.Domain.Database;
using Microsoft.EntityFrameworkCore;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class DeleteWBSOptionCommandHandler : IRequestHandler<DeleteWBSOptionCommand, bool>
    {
        private readonly IWBSOptionRepository _wbsOptionRepository;
        private readonly ProjectManagementContext _context;

        public DeleteWBSOptionCommandHandler(IWBSOptionRepository wbsOptionRepository, ProjectManagementContext context)
        {
            _wbsOptionRepository = wbsOptionRepository;
            _context = context;
        }

        public async Task<bool> Handle(DeleteWBSOptionCommand request, CancellationToken cancellationToken)
        {
            // 1. Fetch the target option
            var targetOption = await _context.WBSOptions
                .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

            if (targetOption == null)
            {
                return false; // Already deleted or doesn't exist
            }

            // 2. Fetch all descendant options (Level 1 -> 2 -> 3) recursively
            // Since depth is small (max 3 levels), we can fetch potential descendants in memory or via simplified queries.
            // Given the known structure (Level 1, 2, 3), we'll fetch relevant levels.
            
            var allOptionsToDelete = new List<EDR.Domain.Entities.WBSOption> { targetOption };

            // Find children (Level 2 if target is Level 1, or Level 3 if target is Level 2)
            var childOptions = await _context.WBSOptions
                .Where(o => o.ParentId == targetOption.Id)
                .ToListAsync(cancellationToken);

            allOptionsToDelete.AddRange(childOptions);

            // Find grandchildren (Level 3 if target is Level 1)
            if (childOptions.Any())
            {
                var childIds = childOptions.Select(c => c.Id).ToList();
                var grandchildOptions = await _context.WBSOptions
                    .Where(o => childIds.Contains(o.ParentId ?? 0)) // Handle nullable ParentId
                    .ToListAsync(cancellationToken);
                
                allOptionsToDelete.AddRange(grandchildOptions);
            }

            var allOptionIds = allOptionsToDelete.Select(o => o.Id).ToList();

            // 4. Validation: Check if any option is in use by WBS Tasks
            var isAnyOptionInUse = await _context.WBSTasks
                .AnyAsync(t => allOptionIds.Contains(t.WBSOptionId), cancellationToken);

            if (isAnyOptionInUse)
            {
                throw new InvalidOperationException("Cannot delete WBS Option because it is associated with one or more WBS Tasks.");
            }

            // 5. Execution: Delete options if safe
            _context.WBSOptions.RemoveRange(allOptionsToDelete);
            
            // We use SaveChangesAsync directly via DbContext since we injected it directly 
            // instead of Repository to handle the complex multi-level logic efficiently.
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}

