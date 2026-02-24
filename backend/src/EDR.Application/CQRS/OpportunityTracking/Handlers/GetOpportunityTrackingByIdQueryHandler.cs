using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.OpportunityTracking.Queries;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.OpportunityTracking.Handlers
{
    public class GetOpportunityTrackingByIdQueryHandler
        : IRequestHandler<GetOpportunityTrackingByIdQuery, OpportunityTrackingDto>
    {
        private readonly IOpportunityTrackingRepository _repository;

        public GetOpportunityTrackingByIdQueryHandler(IOpportunityTrackingRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<OpportunityTrackingDto> Handle(
            GetOpportunityTrackingByIdQuery request,
            CancellationToken cancellationToken)
        {
            var entity = await _repository.GetByIdAsync(request.Id);
            if (entity == null)
            {
                throw new Exception($"Opportunity Tracking with ID {request.Id} not found.");
            }

            return new OpportunityTrackingDto
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
                PercentageChanceOfEDRSuccess = entity.PercentageChanceOfEDRSuccess,
                LikelyCompetition = entity.LikelyCompetition,
                GrossRevenue = entity.GrossRevenue,
                NetEDRRevenue = entity.NetEDRRevenue,
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
                    Status = history.Status.Status,
                    StatusId = history.Status.Id

                })
                .FirstOrDefault()

            };
        }
    }
}


