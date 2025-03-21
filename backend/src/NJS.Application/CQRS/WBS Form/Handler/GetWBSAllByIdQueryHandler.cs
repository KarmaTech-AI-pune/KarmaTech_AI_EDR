using MediatR;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Queries
{
	public class GetWBSAllByProjectIdQueryHandler : IRequestHandler<GetWBSAllByProjectIdQuery, IEnumerable<WBSTaskDto>>
	{
		private readonly IWorkBreakdownStructureRepository _wbsRepository;
		private readonly IMapper _mapper;

		public GetWBSAllByProjectIdQueryHandler(IWorkBreakdownStructureRepository wbsRepository, IMapper mapper)
		{
			_wbsRepository = wbsRepository;
			_mapper = mapper;
		}

		public async Task<IEnumerable<WBSTaskDto>> Handle(GetWBSAllByProjectIdQuery request, CancellationToken cancellationToken)
		{
			var wbsList = _wbsRepository.GetAllByProjectId(request.ProjectId);
			return _mapper.Map<IEnumerable<WBSTaskDto>>(wbsList);
		}
	}
}
