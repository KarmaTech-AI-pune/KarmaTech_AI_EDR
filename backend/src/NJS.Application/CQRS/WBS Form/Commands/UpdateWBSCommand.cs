using MediatR;
using NJS.Application.Dtos;
using MediatR; // Add MediatR namespace

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
	public class UpdateWBSCommand : IRequest<MediatR.Unit>
	{
		public int Id { get; set; }
		public WBSTaskDto WbsDto { get; set; }
	}
}
