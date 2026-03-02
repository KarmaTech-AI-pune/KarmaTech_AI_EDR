using MediatR;
using EDR.Application.CQRS.Programs.Commands;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Programs.Handlers.Commands
{
    public class UpdateProgramCommandHandler : IRequestHandler<UpdateProgramCommand, Unit>
    {
        private readonly ProjectManagementContext _context;
        private readonly IProgramRepository _programRepository;

        public UpdateProgramCommandHandler(ProjectManagementContext context, IProgramRepository programRepository)
        {
            _context = context;
            _programRepository = programRepository;
        }

        public async Task<Unit> Handle(UpdateProgramCommand request, CancellationToken cancellationToken)
        {
            var program = await _context.Programs.FindAsync(new object[] { request.Id }, cancellationToken);

            if (program == null)
            {
                // Handle case where program is not found, e.g., throw an exception or return a specific result
                // For now, we'll assume it exists or the API layer handles not found scenarios.
                // In a real application, you might throw a NotFoundException.
                return Unit.Value;
            }

            program.TenantId = request.TenantId;
            program.Name = request.Name;
            program.Description = request.Description;
            program.StartDate = request.StartDate;
            program.EndDate = request.EndDate;
            program.LastModifiedAt = System.DateTime.UtcNow;
            program.LastModifiedBy = request.LastModifiedBy;

            // Use DbContext for direct database operations
            _context.Programs.Update(program);
            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}

