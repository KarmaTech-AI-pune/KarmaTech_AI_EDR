using MediatR;
using EDR.Application.CQRS.OpportunityTracking.Queries;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.OpportunityTracking.Handlers
{
    public class GetAllOpportunityTrackingsQueryHandler
        : IRequestHandler<GetAllOpportunityTrackingsQuery, IEnumerable<OpportunityTrackingDto>>
    {
        private readonly IOpportunityTrackingRepository _repository;

        public GetAllOpportunityTrackingsQueryHandler(IOpportunityTrackingRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<IEnumerable<OpportunityTrackingDto>> Handle(
            GetAllOpportunityTrackingsQuery request,
            CancellationToken cancellationToken)
        {
            var entities = await _repository.GetAllAsync().ConfigureAwait(false);
            var filteredEntities = entities.AsEnumerable();

            if (request.Status is not null)
            {
                filteredEntities = filteredEntities.Where(x => x.Status == request.Status.Value!);
            }

            if (request.Stage is not null)
            {
                filteredEntities = filteredEntities.Where(x => x.Stage == request.Stage);
            }

            if (request.BidManagerId is not null)
            {
                filteredEntities = filteredEntities.Where(x => x.BidManagerId == request.BidManagerId);
            }

            if (!string.IsNullOrEmpty(request.ClientSector))
            {
                filteredEntities = filteredEntities.Where(x => x.ClientSector == request.ClientSector);
            }

            // Apply sorting
            if (!string.IsNullOrEmpty(request.SortBy))
            {
                filteredEntities = ApplySorting(filteredEntities, request.SortBy, request.IsAscending);
            }

            // Apply pagination
            if (request.PageNumber is not null && request.PageSize is not null)
            {
                filteredEntities = filteredEntities
                    .Skip((int)((request.PageNumber - 1) * request.PageSize))
                    .Take((int)request.PageSize);
            }

            // Map to DTOs
           var result= filteredEntities.Select(entity => new OpportunityTrackingDto
            {
                Id = entity.Id,
                Stage = entity.Stage,
                BidNumber = entity.BidNumber ?? "",
                StrategicRanking = entity.StrategicRanking,
                BidFees = entity.BidFees,
                Emd = entity.Emd,
                FormOfEMD = entity.FormOfEMD,
                BidManagerId = entity.BidManagerId,
                ReviewManagerId = entity.ReviewManagerId,
                ApprovalManagerId = entity.ApprovalManagerId,
                ContactPersonAtClient = entity.ContactPersonAtClient,
                DateOfSubmission = entity.DateOfSubmission,
                PercentageChanceOfProjectHappening = entity.PercentageChanceOfProjectHappening,
                PercentageChanceOfNJSSuccess = entity.PercentageChanceOfNJSSuccess,
                LikelyCompetition = entity.LikelyCompetition,
                GrossRevenue = entity.GrossRevenue,
                NetNJSRevenue = entity.NetNJSRevenue,
                FollowUpComments = entity.FollowUpComments,
                Notes = entity.Notes,
                ProbableQualifyingCriteria = entity.ProbableQualifyingCriteria,
                Operation = entity.Operation,
                WorkName = entity.WorkName,
                Client = entity.Client,
                ClientSector = entity.ClientSector,
                LikelyStartDate = entity.LikelyStartDate,
                Status = entity.Status,
                Currency = entity.Currency,
                CapitalValue = entity.CapitalValue,
                DurationOfProject = entity.DurationOfProject,
                FundingStream = entity.FundingStream,
                ContractType = entity.ContractType,
                CurrentHistory = entity.OpportunityHistories.OrderByDescending(x => x.ActionDate)
                .Select(history => new OpportunityHistoryDto
                {
                    Id = history.Id,
                    OpportunityId = history.OpportunityId,
                    ActionDate = history.ActionDate,
                    Comments = history.Comments,
                    Status = history.Status.Status,
                    StatusId = history.StatusId,
                    Action = history.Action,
                    ActionBy = history.ActionBy,
                    AssignedToId = history.AssignedToId

                })
                .FirstOrDefault()

            });

            return result;
        }

        private IEnumerable<Domain.Entities.OpportunityTracking> ApplySorting(
            IEnumerable<Domain.Entities.OpportunityTracking> entities,
            string sortBy,
            bool isAscending)
        {
            return sortBy.ToLower() switch
            {
                "stage" => isAscending ? entities.OrderBy(x => x.Stage) : entities.OrderByDescending(x => x.Stage),
                "client" => isAscending ? entities.OrderBy(x => x.Client) : entities.OrderByDescending(x => x.Client),
                "workname" => isAscending ? entities.OrderBy(x => x.WorkName) : entities.OrderByDescending(x => x.WorkName),
                "status" => isAscending ? entities.OrderBy(x => x.Status) : entities.OrderByDescending(x => x.Status),
                "dateofsubmission" => isAscending ? entities.OrderBy(x => x.DateOfSubmission) : entities.OrderByDescending(x => x.DateOfSubmission),
                "capitalvalue" => isAscending ? entities.OrderBy(x => x.CapitalValue) : entities.OrderByDescending(x => x.CapitalValue),
                _ => entities.OrderBy(x => x.Id)
            };
        }
    }
}

