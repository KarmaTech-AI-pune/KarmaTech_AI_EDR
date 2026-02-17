using MediatR;
using EDR.Application.CQRS.Programs.Queries;
using EDR.Application.DTOs;
using EDR.Repositories.Interfaces;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper; // Assuming AutoMapper is used for DTO mapping

namespace EDR.Application.CQRS.Programs.Handlers.Queries
{
    public class GetAllProgramsQueryHandler : IRequestHandler<GetAllProgramsQuery, IEnumerable<ProgramDto>>
    {
        private readonly IProgramRepository _programRepository;

        public GetAllProgramsQueryHandler(IProgramRepository programRepository)
        {
            _programRepository = programRepository;
        }

        public async Task<IEnumerable<ProgramDto>> Handle(GetAllProgramsQuery request, CancellationToken cancellationToken)
        {
            var programs = await _programRepository.GetAllAsync(cancellationToken);
            var programDtos = new List<ProgramDto>();
            foreach (var program in programs)
            {
                programDtos.Add(new ProgramDto
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
                });
            }
            return programDtos;
        }
    }
}

