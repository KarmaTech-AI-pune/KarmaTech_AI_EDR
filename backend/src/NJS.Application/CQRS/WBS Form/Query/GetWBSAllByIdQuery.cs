using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Queries
{
	public class GetWBSAllByProjectIdQuery : IRequest<IEnumerable<WBSTaskDto>>
	{
		public int ProjectId { get; set; }
	}
}
