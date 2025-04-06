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
            var allOptions = await _wbsOptionRepository.GetAllAsync();
            
            return allOptions
                .Where(o => o.Level == 2)
                .Select(o => new WBSOptionDto 
                { 
                    Value = o.Value,
                    Label = o.Label 
                })
                .ToList();
        }
    }
}
