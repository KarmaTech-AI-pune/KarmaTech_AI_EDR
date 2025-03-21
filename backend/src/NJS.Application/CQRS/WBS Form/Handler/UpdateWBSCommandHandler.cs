using MediatR;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
	public class UpdateWBSCommandHandler : IRequestHandler<UpdateWBSCommand, MediatR.Unit>
	{
		private readonly IWorkBreakdownStructureRepository _wbsRepository;
		private readonly IMapper _mapper;

		public UpdateWBSCommandHandler(IWorkBreakdownStructureRepository wbsRepository, IMapper mapper)
		{
			_wbsRepository = wbsRepository;
			_mapper = mapper;
		}

		public async Task<MediatR.Unit> Handle(UpdateWBSCommand request, CancellationToken cancellationToken)
		{
			var existingWBS = _wbsRepository.GetById(request.Id);
			if (existingWBS == null)
			{
				return MediatR.Unit.Value; // Or throw exception - decide on error handling strategy
			}

			_mapper.Map(request.WbsDto, existingWBS); // Map DTO to existing entity
			_wbsRepository.Update(existingWBS);
			return MediatR.Unit.Value;
		}
	}
}
