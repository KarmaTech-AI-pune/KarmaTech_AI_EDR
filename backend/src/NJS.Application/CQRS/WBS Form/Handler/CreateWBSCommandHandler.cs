using MediatR;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using NJS.Domain.Entities;
using AutoMapper;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
	public class CreateWBSCommandHandler : IRequestHandler<CreateWBSCommand, WBSTaskDto>
	{
		private readonly IWorkBreakdownStructureRepository _wbsRepository;
		private readonly IMapper _mapper;

		public CreateWBSCommandHandler(IWorkBreakdownStructureRepository wbsRepository, IMapper mapper)
		{
			_wbsRepository = wbsRepository;
			_mapper = mapper;
		}

		public async Task<WBSTaskDto> Handle(CreateWBSCommand request, CancellationToken cancellationToken)
		{
			var wbs = _mapper.Map<WorkBreakdownStructure>(request.WbsTaskDto);
			_wbsRepository.Add(wbs);
			return _mapper.Map<WBSTaskDto>(wbs);
		}
	}
}
