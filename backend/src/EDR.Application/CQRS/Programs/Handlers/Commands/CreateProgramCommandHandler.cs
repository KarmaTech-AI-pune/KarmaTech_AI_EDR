using MediatR;
using EDR.Application.CQRS.Programs.Commands;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Programs.Handlers.Commands
{
    public class CreateProgramCommandHandler : IRequestHandler<CreateProgramCommand, int>
    {
        private readonly ProjectManagementContext _context;
        private readonly IProgramRepository _programRepository;

        public CreateProgramCommandHandler(ProjectManagementContext context, IProgramRepository programRepository)
        {
            _context = context;
            _programRepository = programRepository;
        }

        public async Task<int> Handle(CreateProgramCommand request, CancellationToken cancellationToken)
        {
            var program = new EDR.Domain.Entities.Program
            {
                TenantId = request.TenantId,
                Name = request.Name,
                Description = request.Description,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                CreatedBy = request.CreatedBy,
                LastModifiedAt = System.DateTime.UtcNow, // Set initial modification time
                LastModifiedBy = request.CreatedBy // Set initial modifier
            };

            // Use DbContext for direct database operations
            _context.Programs.Add(program);
            await _context.SaveChangesAsync(cancellationToken);

            return program.Id;
        }
    }
}

