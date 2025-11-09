using MediatR;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class CreateWBSOptionCommandHandler : IRequestHandler<CreateWBSOptionCommand, WBSOptionDto>
    {
        private readonly IWBSOptionRepository _wbsOptionRepository;

        public CreateWBSOptionCommandHandler(IWBSOptionRepository wbsOptionRepository)
        {
            _wbsOptionRepository = wbsOptionRepository;
        }

        public async Task<WBSOptionDto> Handle(CreateWBSOptionCommand request, CancellationToken cancellationToken)
        {
            var wbsOption = new WBSOption
            {
                Label = request.Label,
                Level = request.Level,
                ParentId = request.ParentId,
                FormType = (NJS.Domain.Entities.FormType)request.FormType,
                Value = request.Value
            };

            await _wbsOptionRepository.AddAsync(wbsOption);

            return new WBSOptionDto
            {
                Id = wbsOption.Id,
                Label = wbsOption.Label,
                Level = wbsOption.Level,
                ParentId = wbsOption.ParentId,
                FormType = (int)wbsOption.FormType,
                Value = wbsOption.Value
            };
        }
    }
}
