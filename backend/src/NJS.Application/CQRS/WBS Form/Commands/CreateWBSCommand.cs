using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
	public class CreateWBSCommand : IRequest<WBSTaskDto>
	{
		public WBSTaskDto WbsTaskDto { get; set; }
	}
}
