using MediatR;
using EDR.Application.DTOs;
using System.Collections.Generic;

namespace EDR.Application.CQRS.Feature.Queries
{
    public class GetAllFeaturesQuery : IRequest<List<FeatureDto>>
    {
    }
}

