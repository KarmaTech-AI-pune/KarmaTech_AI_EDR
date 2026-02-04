using MediatR;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WBSOption.Handler
{
    public class UpdateWBSOptionCommandHandler : IRequestHandler<UpdateWBSOptionCommand, List<WBSOptionDto>>
    {
        private readonly IWBSOptionRepository _wbsOptionRepository;

        public UpdateWBSOptionCommandHandler(IWBSOptionRepository wbsOptionRepository)
        {
            _wbsOptionRepository = wbsOptionRepository;
        }

        public async Task<List<WBSOptionDto>> Handle(UpdateWBSOptionCommand request, CancellationToken cancellationToken)
        {
            var resultOptions = new List<WBSOptionDto>();
            var latestOptionByLevel = new Dictionary<int, Domain.Entities.WBSOption>();

            // If a Level 1 ID is provided in the command, seed the dictionary so Level 2 items know their parent.
            if (request.Level1Id.HasValue)
            {
                latestOptionByLevel[1] = new Domain.Entities.WBSOption { Id = request.Level1Id.Value };
            }

            foreach (var optionDto in request.Options)
            {
                int? parentId = null;
                if (optionDto.Level > 1 && latestOptionByLevel.ContainsKey(optionDto.Level - 1))
                {
                    parentId = latestOptionByLevel[optionDto.Level - 1].Id;
                }

                int? finalParentId = parentId ?? optionDto.ParentId;

                Domain.Entities.WBSOption wbsOption;
                if (optionDto.Id > 0)
                {
                    // Update existing option
                    wbsOption = await _wbsOptionRepository.GetByIdAsync(optionDto.Id);
                    if (wbsOption != null)
                    {
                        wbsOption.Value = optionDto.Value;
                        wbsOption.Label = optionDto.Label;
                        wbsOption.Level = optionDto.Level;
                        wbsOption.ParentId = finalParentId;
                        wbsOption.FormType = (NJS.Domain.Entities.FormType)optionDto.FormType;
                        await _wbsOptionRepository.UpdateAsync(wbsOption);
                    }
                }
                else
                {
                    // Create new option
                    wbsOption = new Domain.Entities.WBSOption
                    {
                        Label = optionDto.Label,
                        Level = optionDto.Level,
                        ParentId = finalParentId,
                        FormType = (NJS.Domain.Entities.FormType)optionDto.FormType,
                        Value = optionDto.Value
                    };
                    await _wbsOptionRepository.AddAsync(wbsOption);
                }

                if (wbsOption != null)
                {
                    latestOptionByLevel[wbsOption.Level] = wbsOption;

                    resultOptions.Add(new WBSOptionDto
                    {
                        Id = wbsOption.Id,
                        Value = wbsOption.Value,
                        Label = wbsOption.Label,
                        Level = wbsOption.Level,
                        ParentId = wbsOption.ParentId,
                        FormType = (int)wbsOption.FormType
                    });
                }
            }

            return resultOptions;
        }
    }
}
