using MediatR;
using EDR.Application.CQRS.WorkBreakdownStructures.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.WBSOption.Handler
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
            var allOptions = await _wbsOptionRepository.GetAllAsync();
            var options = allOptions.Where(o => o.Level == 3 && o.ParentId == request.Level2Id);

            if (request.FormType.HasValue)
            {
                options = options.Where(o => o.FormType == request.FormType.Value);
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

