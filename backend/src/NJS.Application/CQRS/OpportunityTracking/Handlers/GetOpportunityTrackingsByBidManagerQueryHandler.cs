using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NJS.Application.CQRS.OpportunityTracking.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Enums;
using NJS.Repositories.Interfaces;

namespace NJS.Application.CQRS.OpportunityTracking.Handlers
{
    public class GetOpportunityTrackingsByBidManagerQueryHandler : IRequestHandler<GetOpportunityTrackingsByBidManagerQuery, IEnumerable<OpportunityTrackingDto>>
    {
        private readonly IOpportunityTrackingRepository _repository;

        public GetOpportunityTrackingsByBidManagerQueryHandler(IOpportunityTrackingRepository repository)
        {
            _repository = repository;
        }
       
        public async Task<IEnumerable<OpportunityTrackingDto>> Handle(GetOpportunityTrackingsByBidManagerQuery request, CancellationToken cancellationToken)
        {
            var opportunities = await _repository.GetByBidManagerIdAsync(request.BidManagerId);
            return opportunities.Select(o => new OpportunityTrackingDto
            {
                Id = o.Id,
                Stage = o.Stage,
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
                PercentageChanceOfNJSSuccess = o.PercentageChanceOfNJSSuccess,
                LikelyCompetition = o.LikelyCompetition,
                GrossRevenue = o.GrossRevenue,
                NetNJSRevenue = o.NetNJSRevenue,
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
