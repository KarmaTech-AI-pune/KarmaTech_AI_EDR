using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.CheckReview.Queries
{
    public class GetCheckReviewByIdQuery : IRequest<CheckReviewDto>
    {
        public int Id { get; set; }
    }
}

