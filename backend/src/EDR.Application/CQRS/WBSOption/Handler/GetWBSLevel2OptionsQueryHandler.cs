using MediatR;
using EDR.Application.CQRS.WorkBreakdownStructures.Queries;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.WBSOption.Handler
{
    public class GetWBSLevel2OptionsQueryHandler : IRequestHandler<GetWBSLevel2OptionsQuery, List<WBSOptionDto>>
    {
        private readonly IWBSOptionRepository _wbsOptionRepository;

        public GetWBSLevel2OptionsQueryHandler(IWBSOptionRepository wbsOptionRepository)
        {
            _wbsOptionRepository = wbsOptionRepository;
        }

        public async Task<List<WBSOptionDto>> Handle(GetWBSLevel2OptionsQuery request, CancellationToken cancellationToken)
        {
            var allOptions = await _wbsOptionRepository.GetAllAsync();
            var options = allOptions.Where(o => o.Level == 2 && o.ParentId == request.Level1Id);

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

