using System.Collections.Generic;
using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.CheckReview.Queries
{
    public class GetCheckReviewsByProjectQuery : IRequest<IEnumerable<CheckReviewDto>>
    {
        public int ProjectId { get; set; }
    }
}
