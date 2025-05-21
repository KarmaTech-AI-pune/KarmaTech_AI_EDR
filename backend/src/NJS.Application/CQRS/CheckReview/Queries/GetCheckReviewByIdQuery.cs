using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.CheckReview.Queries
{
    public class GetCheckReviewByIdQuery : IRequest<CheckReviewDto>
    {
        public int Id { get; set; }
    }
}
