using MediatR;
using EDR.Application.CQRS.WorkBreakdownStructures.Queries;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class GetWBSLevel1OptionsQueryHandler : IRequestHandler<GetWBSLevel1OptionsQuery, List<WBSOptionDto>>
    {
        private readonly IWBSOptionRepository _wbsOptionRepository;

        public GetWBSLevel1OptionsQueryHandler(IWBSOptionRepository wbsOptionRepository)
        {
            _wbsOptionRepository = wbsOptionRepository ?? throw new ArgumentNullException(nameof(wbsOptionRepository));
        }

        public async Task<List<WBSOptionDto>> Handle(GetWBSLevel1OptionsQuery request, CancellationToken cancellationToken)
        {
            IEnumerable<EDR.Domain.Entities.WBSOption> options;

            if (request.FormType.HasValue)
            {
                options = await _wbsOptionRepository.GetByLevelAndFormTypeAsync(1, request.FormType.Value);
            }
            else
            {
                options = await _wbsOptionRepository.GetByLevelAsync(1);
            }

            return options
                .Select(o => new WBSOptionDto
                {
                    Id = o.Id,
                    Value = o.Value,
                    Label = o.Label,
                    Level = o.Level,
                    ParentId  = o.ParentId,
                    FormType = (int)o.FormType
                })
                .ToList();
        }
    }
}

