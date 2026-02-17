using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.OpportunityTracking.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Enums;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.OpportunityTracking.Handlers
{
    public class GetOpportunityTrackingsByRegionalManagerQueryHandler : IRequestHandler<GetOpportunityTrackingsByRegionalManagerQuery, IEnumerable<OpportunityTrackingDto>>
    {
        private readonly IOpportunityTrackingRepository _repository;

        public GetOpportunityTrackingsByRegionalManagerQueryHandler(IOpportunityTrackingRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<OpportunityTrackingDto>> Handle(GetOpportunityTrackingsByRegionalManagerQuery request, CancellationToken cancellationToken)
        {
            var opportunities = await _repository.GetByRegionalManagerIdAsync(request.RegionalManagerId);
            return opportunities.Select(o => new OpportunityTrackingDto
            {
                Id = o.Id,
                Stage = o.Stage,
                BidNumber = o.BidNumber ?? "",
                StrategicRanking = o.StrategicRanking,
                BidFees = o.BidFees,
                Emd = o.Emd,
                FormOfEMD = o.FormOfEMD,
                BidManagerId = o.BidManagerId,
                ReviewManagerId = o.ReviewManagerId,
                ApprovalManagerId = o.ApprovalManagerId,
                ContactPersonAtClient = o.ContactPersonAtClient,
                DateOfSubmission = o.DateOfSubmission,
                PercentageChanceOfProjectHappening = o.PercentageChanceOfProjectHappening,
                PercentageChanceOfEDRSuccess = o.PercentageChanceOfEDRSuccess,
                LikelyCompetition = o.LikelyCompetition,
                GrossRevenue = o.GrossRevenue,
                NetEDRRevenue = o.NetEDRRevenue,
                FollowUpComments = o.FollowUpComments,
                Notes = o.Notes,
                ProbableQualifyingCriteria = o.ProbableQualifyingCriteria,
                Operation = o.Operation,
                WorkName = o.WorkName,
                Client = o.Client,
                ClientSector = o.ClientSector,
                LikelyStartDate = o.LikelyStartDate,
                Status = o.Status,
                Currency = o.Currency,
                CapitalValue = o.CapitalValue,
                DurationOfProject = o.DurationOfProject,
                FundingStream = o.FundingStream,
                ContractType = o.ContractType,
                CurrentHistory = o.OpportunityHistories
                    .OrderByDescending(h => h.ActionDate)
                    .Select(h => new OpportunityHistoryDto
                    {
                        Id = h.Id,
                        OpportunityId = h.OpportunityId,
                        ActionDate = h.ActionDate,
                        Comments = h.Comments,
                        Status = h.Status.Status,
                        StatusId = h.StatusId,
                        Action = h.Action,
                        ActionBy = h.ActionBy,
                        AssignedToId = h.AssignedToId
                    })
                    .FirstOrDefault()
            });
        }
    }
}


