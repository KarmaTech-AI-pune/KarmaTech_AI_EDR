using MediatR;

namespace EDR.Application.CQRS.CheckReview.Commands
{
    public class DeleteCheckReviewCommand : IRequest<bool>
    {
        public int Id { get; set; }
    }
}

