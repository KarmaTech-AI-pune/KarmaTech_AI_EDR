using MediatR;
using EDR.Application.CQRS.Programs.Commands;
using EDR.Domain.Database;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Programs.Handlers.Commands
{
    public class DeleteProgramCommandHandler : IRequestHandler<DeleteProgramCommand, Unit>
    {
        private readonly ProjectManagementContext _context;
        private readonly IProgramRepository _programRepository;

        public DeleteProgramCommandHandler(ProjectManagementContext context, IProgramRepository programRepository)
        {
            _context = context;
            _programRepository = programRepository;
        }

        public async Task<Unit> Handle(DeleteProgramCommand request, CancellationToken cancellationToken)
        {
            var program = await _context.Programs.FindAsync(new object[] { request.Id }, cancellationToken);

            if (program != null)
            {
                // Use DbContext for direct database operations
                _context.Programs.Remove(program);
                await _context.SaveChangesAsync(cancellationToken);
            }

            return Unit.Value;
        }
    }
}

