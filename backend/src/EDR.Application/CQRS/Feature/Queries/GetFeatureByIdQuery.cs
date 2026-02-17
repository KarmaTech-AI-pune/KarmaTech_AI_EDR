using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.Feature.Queries
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

