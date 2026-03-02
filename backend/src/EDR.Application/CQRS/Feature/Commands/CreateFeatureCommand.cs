
using MediatR;
using EDR.Application.DTOs;
using EDR.Domain.Entities;

namespace EDR.Application.CQRS.Feature.Commands
{
    public class CreateFeatureCommand : IRequest<FeatureDto>
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public bool IsActive { get; set; } = true;
    }
}

