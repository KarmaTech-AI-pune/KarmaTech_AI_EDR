using MediatR;
using EDR.Application.CQRS.Programs.Queries;
using EDR.Application.DTOs;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Programs.Handlers.Queries
{
    public class GetProgramByIdQueryHandler : IRequestHandler<GetProgramByIdQuery, ProgramDto>
    {
        private readonly IProgramRepository _programRepository;

        public GetProgramByIdQueryHandler(IProgramRepository programRepository)
        {
            _programRepository = programRepository;
        }

        public async Task<ProgramDto> Handle(GetProgramByIdQuery request, CancellationToken cancellationToken)
        {
            var program = await _programRepository.GetByIdAsync(request.Id, cancellationToken);
            // In a real application, you would handle the case where program is null,
            // potentially by throwing a NotFoundException.

            if (program == null)
            {
                // Or throw a specific NotFoundException
                return null; 
            }

            // Manually map Program entity to ProgramDto
            var programDto = new ProgramDto
            {
                Id = program.Id,
                TenantId = program.TenantId,
                Name = program.Name,
                Description = program.Description,
                StartDate = program.StartDate,
                EndDate = program.EndDate,
                CreatedBy = program.CreatedBy,
                LastModifiedAt = program.LastModifiedAt,
                LastModifiedBy = program.LastModifiedBy
            };

            return programDto;
        }
    }
}

