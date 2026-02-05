using MediatR;

namespace NJS.Application.CQRS.Feature.Commands
{
    public class DeleteFeatureCommand : IRequest<bool>
    {
        public int Id { get; set; }

        public DeleteFeatureCommand(int id)
        {
            Id = id;
        }
    }
}
