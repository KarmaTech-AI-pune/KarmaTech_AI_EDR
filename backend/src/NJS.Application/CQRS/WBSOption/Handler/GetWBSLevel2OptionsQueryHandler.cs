using MediatR;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class GetWBSLevel2OptionsQueryHandler : IRequestHandler<GetWBSLevel2OptionsQuery, List<WBSOptionDto>>
    {
        private readonly IWBSOptionRepository _wbsOptionRepository;

        public GetWBSLevel2OptionsQueryHandler(IWBSOptionRepository wbsOptionRepository)
        {
            _wbsOptionRepository = wbsOptionRepository ?? throw new ArgumentNullException(nameof(wbsOptionRepository));
        }

        public async Task<List<WBSOptionDto>> Handle(GetWBSLevel2OptionsQuery request, CancellationToken cancellationToken)
        {
            IEnumerable<NJS.Domain.Entities.WBSOption> options;

            if (request.FormType.HasValue)
            {
                options = await _wbsOptionRepository.GetByLevelAndFormTypeAsync(2, request.FormType.Value);
            }
            else
            {
                options = await _wbsOptionRepository.GetByLevelAsync(2);
            }

            return options
                .Select(o => new WBSOptionDto
                {
                    Id = o.Id,
                    Value = o.Value,
                    Label = o.Label,
                    Level = o.Level,
                    ParentValue = o.ParentValue,
                    FormType = (int)o.FormType
                })
                .ToList();
        }
    }
}
