using MediatR;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class GetWBSOptionsQueryHandler : IRequestHandler<GetWBSOptionsQuery, WBSLevelOptionsDto>
    {
        private readonly IWBSOptionRepository _wbsOptionRepository;

        public GetWBSOptionsQueryHandler(IWBSOptionRepository wbsOptionRepository)
        {
            _wbsOptionRepository = wbsOptionRepository ?? throw new ArgumentNullException(nameof(wbsOptionRepository));
        }

        public async Task<WBSLevelOptionsDto> Handle(GetWBSOptionsQuery request, CancellationToken cancellationToken)
        {
            // Fetch WBS options based on form type if specified
            IEnumerable<WBSOption> allOptions;
            if (request.FormType.HasValue)
            {
                allOptions = await _wbsOptionRepository.GetByFormTypeAsync(request.FormType.Value);
            }
            else
            {
                allOptions = await _wbsOptionRepository.GetAllAsync();
            }

            var result = new WBSLevelOptionsDto
            {
                Level1 = allOptions
                    .Where(o => o.Level == 1)
                    .Select(o => new WBSOptionDto
                    {
                        Value = o.Value,
                        Label = o.Label
                    })
                    .ToList(),

                Level2 = allOptions
                    .Where(o => o.Level == 2)
                    .Select(o => new WBSOptionDto
                    {
                        Value = o.Value,
                        Label = o.Label
                    })
                    .ToList(),

                Level3 = allOptions
                    .Where(o => o.Level == 3)
                    .GroupBy(o => o.ParentValue)
                    .ToDictionary(
                        g => g.Key ?? string.Empty,
                        g => g.Select(o => new WBSOptionDto
                        {
                            Value = o.Value,
                            Label = o.Label
                        }).ToList()
                    )
            };

            return result;
        }
    }
}
