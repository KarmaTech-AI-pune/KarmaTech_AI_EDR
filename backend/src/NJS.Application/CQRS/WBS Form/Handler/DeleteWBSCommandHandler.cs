using MediatR;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
	public class DeleteWBSCommandHandler : IRequestHandler<DeleteWBSCommand, MediatR.Unit>
	{
		private readonly IWorkBreakdownStructureRepository _wbsRepository;

		public DeleteWBSCommandHandler(IWorkBreakdownStructureRepository wbsRepository)
		{
			_wbsRepository = wbsRepository;
		}

		public async Task<MediatR.Unit> Handle(DeleteWBSCommand request, CancellationToken cancellationToken)
		{
			_wbsRepository.Delete(request.Id);
			return MediatR.Unit.Value;
		}
	}
}
