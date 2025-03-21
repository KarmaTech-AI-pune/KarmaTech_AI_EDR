using MediatR;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Queries
{
	public class GetWBSByIdQueryHandler : IRequestHandler<GetWBSByIdQuery, WBSTaskDto>
	{
		private readonly IWorkBreakdownStructureRepository _wbsRepository;
		private readonly IMapper _mapper;

		public GetWBSByIdQueryHandler(IWorkBreakdownStructureRepository wbsRepository, IMapper mapper)
		{
			_wbsRepository = wbsRepository;
			_mapper = mapper;
		}

		public async Task<WBSTaskDto> Handle(GetWBSByIdQuery request, CancellationToken cancellationToken)
		{
			var wbs = _wbsRepository.GetById(request.Id);
			return _mapper.Map<WBSTaskDto>(wbs);
		}
	}
}
