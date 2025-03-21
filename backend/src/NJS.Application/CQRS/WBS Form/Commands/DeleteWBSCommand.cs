using MediatR;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
	public class DeleteWBSCommand : IRequest<MediatR.Unit>
	{
		public int Id { get; set; }
	}
}
