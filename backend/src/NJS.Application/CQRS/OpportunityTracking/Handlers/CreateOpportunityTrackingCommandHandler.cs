using MediatR;
using NJS.Application.CQRS.OpportunityTracking.Commands;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

namespace NJS.Application.CQRS.OpportunityTracking.Handlers
{
    public class CreateOpportunityTrackingCommandHandler
        : IRequestHandler<CreateOpportunityTrackingCommand, OpportunityTrackingDto>
    {
        private readonly IOpportunityTrackingRepository _repository;
        private readonly ISettingsRepository _settingsRepository;
        private readonly IUserContext _userContext;
        
        public CreateOpportunityTrackingCommandHandler(
            IOpportunityTrackingRepository repository, 
            ISettingsRepository settingsRepository,
            IUserContext userContext)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _settingsRepository = settingsRepository ?? throw new ArgumentNullException(nameof(settingsRepository));
            _userContext = userContext;
        }

        public async Task<OpportunityTrackingDto> Handle(
            CreateOpportunityTrackingCommand request,
            CancellationToken cancellationToken)
        {
            var histories = new List<OpportunityHistory>();
            var currentDateTime = DateTime.UtcNow;
            var currentUser = _userContext.GetCurrentUserId();
            
            // Get next bid number
            int nextBidNumber = await _settingsRepository.GetNextBidNumberAsync();
            string formattedBidNumber = nextBidNumber.ToString("0000000");
            
            // Map command to entity
            var entity = new Domain.Entities.OpportunityTracking
            {
                BidNumber = formattedBidNumber,
                Stage = request.Stage,
                StrategicRanking = request.StrategicRanking,
                BidFees = request.BidFees,
                Emd = request.Emd,
                FormOfEMD = request.FormOfEMD,
                BidManagerId = request.BidManagerId,
                ReviewManagerId = request.ReviewManagerId,
                ApprovalManagerId = request.ApprovalManagerId,
                ContactPersonAtClient = request.ContactPersonAtClient,
                DateOfSubmission = request.DateOfSubmission,
                PercentageChanceOfProjectHappening = request.PercentageChanceOfProjectHappening,
                PercentageChanceOfNJSSuccess = request.PercentageChanceOfNJSSuccess,
                LikelyCompetition = request.LikelyCompetition,
                GrossRevenue = request.GrossRevenue,
                NetNJSRevenue = request.NetNJSRevenue,
                FollowUpComments = request.FollowUpComments,
                Notes = request.Notes,
                ProbableQualifyingCriteria = request.ProbableQualifyingCriteria,
                Operation = request.Operation,
                WorkName = request.WorkName,
                Client = request.Client,
                ClientSector = request.ClientSector,
                LikelyStartDate = request.LikelyStartDate,
                Status = request.Status,
                Currency = request.Currency,
                CapitalValue = request.CapitalValue,
                DurationOfProject = request.DurationOfProject,
                FundingStream = request.FundingStream,
                ContractType = request.ContractType,
                CreatedBy=_userContext.GetCurrentUserId(),
                CreatedAt = currentDateTime,
                UpdatedAt = currentDateTime
            };
            if (entity.ReviewManagerId is not null)
            {
                histories.Add(new OpportunityHistory
                {
                    StatusId = 1,
                    AssignedToId = entity.ReviewManagerId,
                    Action = "Submitted",
                    Comments= "Submitted",
                    ActionDate = currentDateTime,
                    ActionBy= currentUser
                });
            }
            if (entity.ApprovalManagerId is not null)
            {
                histories.Add(new OpportunityHistory
                {
                    StatusId = 1,
                    AssignedToId = entity.ApprovalManagerId,
                    Action = "Submitted",
                    Comments = "Submitted",
                    ActionDate = currentDateTime,
                    ActionBy = currentUser
                });
            }
            if (entity.BidManagerId is not null)
            {
                histories.Add(new OpportunityHistory
                {
                    StatusId = 1,
                    AssignedToId = entity.BidManagerId,
                    Action = "Submitted",
                    Comments = "Submitted",
                    ActionDate = currentDateTime,
                    ActionBy = currentUser
                });
            }

            // Save to database
            entity.OpportunityHistories = histories;
            var result = await _repository.AddAsync(entity);
             

            // Map entity to DTO
            return new OpportunityTrackingDto
            {
                Id = result.Id,
                BidNumber = result.BidNumber,
                Stage = result.Stage,
                StrategicRanking = result.StrategicRanking,
                BidFees = result.BidFees,
                Emd = result.Emd,
                FormOfEMD = result.FormOfEMD,
                BidManagerId = result.BidManagerId,
                ReviewManagerId = result.ReviewManagerId,
                ApprovalManagerId = result.ApprovalManagerId,
                ContactPersonAtClient = result.ContactPersonAtClient,
                DateOfSubmission = result.DateOfSubmission,
                PercentageChanceOfProjectHappening = result.PercentageChanceOfProjectHappening,
                PercentageChanceOfNJSSuccess = result.PercentageChanceOfNJSSuccess,
                LikelyCompetition = result.LikelyCompetition,
                GrossRevenue = result.GrossRevenue,
                NetNJSRevenue = result.NetNJSRevenue,
                FollowUpComments = result.FollowUpComments,
                Notes = result.Notes,
                ProbableQualifyingCriteria = result.ProbableQualifyingCriteria,
                Operation = result.Operation,
                WorkName = result.WorkName,
                Client = result.Client,
                ClientSector = result.ClientSector,
                LikelyStartDate = result.LikelyStartDate,
                Status = result.Status,
                Currency = result.Currency,
                CapitalValue = result.CapitalValue,
                DurationOfProject = result.DurationOfProject,
                FundingStream = result.FundingStream,
                ContractType = result.ContractType
            };
        }
    }
}
