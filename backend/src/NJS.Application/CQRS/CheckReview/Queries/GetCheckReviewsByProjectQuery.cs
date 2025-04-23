using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.CheckReview.Queries
{
    public class GetCheckReviewsByProjectQuery : IRequest<IEnumerable<CheckReviewDto>>
    {
        public int ProjectId { get; set; }
    }
}
