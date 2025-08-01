using MediatR;
using NJS.Application.DTOs;
using System.Collections.Generic;

namespace NJS.Application.CQRS.Feature.Queries
{
    public class GetAllFeaturesQuery : IRequest<List<FeatureDto>>
    {
    }
}
