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

            var allOptions = await _wbsOptionRepository.GetAllAsync();
            
            return allOptions
                .Where(o => o.Level == 3 && o.ParentValue == request.Level2Value)
                .Select(o => new WBSOptionDto 
                { 
                    Value = o.Value,
                    Label = o.Label 
                })
                .ToList();
        }
    }
}
