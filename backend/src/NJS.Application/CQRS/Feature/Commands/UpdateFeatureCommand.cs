using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.Feature.Commands
{
    public class UpdateFeatureCommand : IRequest<FeatureDto>
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal? PriceUSD { get; set; }
        public decimal? PriceINR { get; set; }
    }
}
