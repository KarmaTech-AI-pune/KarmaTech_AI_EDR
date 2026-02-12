
using MediatR;
using NJS.Application.DTOs;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Feature.Commands
{
    public class CreateFeatureCommand : IRequest<FeatureDto>
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
