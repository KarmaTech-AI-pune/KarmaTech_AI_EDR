using MediatR;
using NJS.Application.CQRS.Projects.Commands;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

namespace NJS.Application.CQRS.Projects.Handlers
{
    public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, int>
    {
        private readonly IProjectRepository _repository;
        public CreateProjectCommandHandler(IProjectRepository repository)
        {
            _repository = repository;
        }
        public async Task<int> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
        {
            //TODO:Add Mapper
            var project = new Project
            {
                Name = request.Name,
                ClientName = request.ClientName,
                ClientSector = request.ClientSector,
                Sector = request.Sector,
                EstimatedCost = request.EstimatedCost,
                CapitalValue = request.CapitalValue,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Status = request.Status,
                Progress = request.Progress,
                DurationInMonths = request.DurationInMonths,
                FundingStream = request.FundingStream,
                ContractType = request.ContractType,
                Currency = request.Currency,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = request.CreatedBy
            };

            await _repository.Add(project);
            return project.Id;

        }


    }
}
