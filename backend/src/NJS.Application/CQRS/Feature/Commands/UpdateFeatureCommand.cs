using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.Feature.Commands
{
    public class UpdateFeatureCommand : IRequest<FeatureDto>
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
    }
}

