using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Queries
{
	public class GetWBSByIdQuery : IRequest<WBSTaskDto>
	{
		public int Id { get; set; }
	}
}
