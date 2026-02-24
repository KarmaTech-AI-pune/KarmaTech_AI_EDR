using MediatR;
using EDR.Application.CQRS.WorkBreakdownStructures.Commands;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class CreateWBSOptionCommandHandler : IRequestHandler<CreateWBSOptionCommand, List<WBSOptionDto>>
    {
        private readonly IWBSOptionRepository _wbsOptionRepository;

        public CreateWBSOptionCommandHandler(IWBSOptionRepository wbsOptionRepository)
        {
            _wbsOptionRepository = wbsOptionRepository;
        }

        public async Task<List<WBSOptionDto>> Handle(CreateWBSOptionCommand request, CancellationToken cancellationToken)
        {
            var createdOptions = new List<WBSOptionDto>();
            var latestOptionByLevel = new Dictionary<int, EDR.Domain.Entities.WBSOption>(); // Level -> WBSOption entity

            // The request.Options should be ordered by the client: L1, then its L2 children, then L3 children, etc.
            // Ensure parents are processed before children by sorting by Level.
            var sortedOptions = request.Options.OrderBy(o => o.Level).ToList();

            foreach (var optionDto in sortedOptions)
            {
                int? parentId = null;
                // If the current option's level is greater than 1, find the last created option from the previous level.
                if (optionDto.Level > 1 && latestOptionByLevel.ContainsKey(optionDto.Level - 1))
                {
                    parentId = latestOptionByLevel[optionDto.Level - 1].Id;
                }

                // If not found in the current batch (parentId is null), use the ParentId provided in the DTO.
                // This supports adding children to *existing* parents that are not part of this creation batch.
                int? finalParentId = parentId ?? optionDto.ParentId;

                var wbsOption = new EDR.Domain.Entities.WBSOption
                {
                    Label = optionDto.Label,
                    Level = optionDto.Level,
                    ParentId = finalParentId,
                    FormType = (EDR.Domain.Entities.FormType)optionDto.FormType,
                    Value = optionDto.Value
                };

                await _wbsOptionRepository.AddAsync(wbsOption);

                // Update the dictionary with the most recently created option for this level.
                latestOptionByLevel[wbsOption.Level] = wbsOption;

                var createdDto = new WBSOptionDto
                {
                    Id = wbsOption.Id,
                    Label = wbsOption.Label,
                    Level = wbsOption.Level,
                    ParentId = wbsOption.ParentId,
                    FormType = (int)wbsOption.FormType,
                    Value = wbsOption.Value
                };

                createdOptions.Add(createdDto);
            }

            return createdOptions;
        }
    }
}

