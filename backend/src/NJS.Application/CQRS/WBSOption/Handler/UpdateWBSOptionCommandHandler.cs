using MediatR;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class UpdateWBSOptionCommandHandler : IRequestHandler<UpdateWBSOptionCommand, WBSOptionDto>
    {
        private readonly IWBSOptionRepository _wbsOptionRepository;

        public UpdateWBSOptionCommandHandler(IWBSOptionRepository wbsOptionRepository)
        {
            _wbsOptionRepository = wbsOptionRepository;
        }

        public async Task<WBSOptionDto> Handle(UpdateWBSOptionCommand request, CancellationToken cancellationToken)
        {
            var wbsOption = await _wbsOptionRepository.GetByIdAsync(request.Id);

            if (wbsOption == null)
            {
                return null; // Or throw an exception
            }

            wbsOption.Value = request.Value;
            wbsOption.Label = request.Label;
            wbsOption.Level = request.Level;
            wbsOption.ParentId = request.ParentId;
            wbsOption.FormType = (NJS.Domain.Entities.FormType)request.FormType;

            await _wbsOptionRepository.UpdateAsync(wbsOption);

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
