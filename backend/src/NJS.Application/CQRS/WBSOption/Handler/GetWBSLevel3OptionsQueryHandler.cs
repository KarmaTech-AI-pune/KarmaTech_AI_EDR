using MediatR;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class GetWBSLevel3OptionsQueryHandler : IRequestHandler<GetWBSLevel3OptionsQuery, List<WBSOptionDto>>
    {
        private readonly IWBSOptionRepository _wbsOptionRepository;

        public GetWBSLevel3OptionsQueryHandler(IWBSOptionRepository wbsOptionRepository)
        {
            _wbsOptionRepository = wbsOptionRepository ?? throw new ArgumentNullException(nameof(wbsOptionRepository));
        }

        public async Task<List<WBSOptionDto>> Handle(GetWBSLevel3OptionsQuery request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.Level2Value))
            {
                return new List<WBSOptionDto>();
            }

            // First, get the Level2 option by its value to get its ID
            var level2Options = await _wbsOptionRepository.GetByLevelAndFormTypeAsync(2, request.FormType ?? FormType.Manpower);
            var level2Option = level2Options.FirstOrDefault(o => o.Value == request.Level2Value);
            
            if (level2Option == null)
            {
                return new List<WBSOptionDto>();
            }

            IEnumerable<NJS.Domain.Entities.WBSOption> options;

            if (request.FormType.HasValue)
            {
                options = await _wbsOptionRepository.GetByLevelParentAndFormTypeAsync(3, level2Option.Id, request.FormType.Value);
            }
            else
            {
                options = await _wbsOptionRepository.GetByLevelAndParentAsync(3, level2Option.Id);
            }

            return options
                .Select(o => new WBSOptionDto
                {
                    Id = o.Id,
                    Value = o.Value,
                    Label = o.Label,
                    Level = o.Level,
                    ParentId = o.ParentId,
                    FormType = (int)o.FormType
                })
                .ToList();
        }
    }
}
