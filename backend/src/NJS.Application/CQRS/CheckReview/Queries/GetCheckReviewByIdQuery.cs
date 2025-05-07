using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.CheckReview.Queries
{
    public class GetCheckReviewByIdQuery : IRequest<CheckReviewDto>
    {
        public int Id { get; set; }
    }
}
