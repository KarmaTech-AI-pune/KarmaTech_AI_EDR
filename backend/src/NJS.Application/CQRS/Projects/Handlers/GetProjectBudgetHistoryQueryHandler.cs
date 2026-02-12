using MediatR;
using NJS.Application.CQRS.Projects.Queries;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Projects.Handlers
{
    public class GetProjectBudgetHistoryQueryHandler : IRequestHandler<GetProjectBudgetHistoryQuery, ProjectBudgetHistoryResponseDto>
    {
        private readonly IProjectBudgetChangeHistoryRepository _historyRepository;

        public GetProjectBudgetHistoryQueryHandler(IProjectBudgetChangeHistoryRepository historyRepository)
        {
            _historyRepository = historyRepository ?? throw new ArgumentNullException(nameof(historyRepository));
        }

        public async Task<ProjectBudgetHistoryResponseDto> Handle(GetProjectBudgetHistoryQuery request, CancellationToken cancellationToken)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            // Get the filtered and paginated history records
            var historyRecords = await _historyRepository.GetByProjectIdWithFilteringAsync(
                request.ProjectId,
                request.FieldName,
                request.PageNumber,
                request.PageSize);

            // Get the total count for pagination
            var totalCount = await _historyRepository.GetCountByProjectIdAsync(request.ProjectId, request.FieldName);

            // Map to DTOs
            var historyDtos = historyRecords.Select(MapToDto).ToList();

            return new ProjectBudgetHistoryResponseDto
            {
                History = historyDtos,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };
        }

        private ProjectBudgetChangeHistoryDto MapToDto(Domain.Entities.ProjectBudgetChangeHistory history)
        {
            return new ProjectBudgetChangeHistoryDto
            {
                Id = history.Id,
                ProjectId = history.ProjectId,
                FieldName = history.FieldName,
                OldValue = history.OldValue,
                NewValue = history.NewValue,
                Variance = history.Variance,
                PercentageVariance = history.PercentageVariance,
                Currency = history.Currency,
                ChangedBy = history.ChangedBy,
                ChangedByUser = history.ChangedByUser != null ? new UserDto
                {
                    Id = history.ChangedByUser.Id,
                    Name = history.ChangedByUser.Name,
                    Email = history.ChangedByUser.Email ?? string.Empty,
                    UserName = history.ChangedByUser.UserName ?? string.Empty
                } : null,
                ChangedDate = history.ChangedDate,
                Reason = history.Reason
            };
        }
    }
}