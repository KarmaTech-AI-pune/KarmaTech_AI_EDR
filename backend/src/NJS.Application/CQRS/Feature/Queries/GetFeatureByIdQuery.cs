using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.Feature.Queries
{
    public class GetFeatureByIdQuery : IRequest<FeatureDto>
    {
        public int Id { get; set; }

        public GetFeatureByIdQuery(int id)
        {
            Id = id;
        }
    }
}
