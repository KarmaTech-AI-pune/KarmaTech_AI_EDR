using System.Collections.Generic;
using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.CheckReview.Queries
{
    public class GetCheckReviewsByProjectQuery : IRequest<IEnumerable<CheckReviewDto>>
    {
        public int ProjectId { get; set; }
    }
}

