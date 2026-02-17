using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.OpportunityTracking.Commands;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.OpportunityTracking.Handlers
{
    public class UpdateOpportunityTrackingCommandHandler 
        : IRequestHandler<UpdateOpportunityTrackingCommand, OpportunityTrackingDto>
    {
        private readonly IOpportunityTrackingRepository _repository;

        public UpdateOpportunityTrackingCommandHandler(
            IOpportunityTrackingRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<OpportunityTrackingDto> Handle(
            UpdateOpportunityTrackingCommand request,
            CancellationToken cancellationToken)
        {
            var existingEntity = await _repository.GetByIdAsync(request.Id);
            if (existingEntity == null)
            {
                throw new Exception($"Opportunity Tracking with ID {request.Id} not found.");
            }

            // Update entity properties
          
            existingEntity.Stage = request.Stage;
            existingEntity.StrategicRanking = request.StrategicRanking;
            existingEntity.BidFees = request.BidFees;
            existingEntity.Emd = request.Emd;
            existingEntity.FormOfEMD = request.FormOfEMD;
            existingEntity.BidManagerId = request.BidManagerId;
            existingEntity.ReviewManagerId = request.ReviewManagerId;
            existingEntity.ApprovalManagerId = request.ApprovalManagerId;
            existingEntity.ContactPersonAtClient = request.ContactPersonAtClient;
            existingEntity.DateOfSubmission = request.DateOfSubmission;
            existingEntity.PercentageChanceOfProjectHappening = request.PercentageChanceOfProjectHappening;
            existingEntity.PercentageChanceOfNJSSuccess = request.PercentageChanceOfNJSSuccess;
            existingEntity.LikelyCompetition = request.LikelyCompetition;
            existingEntity.GrossRevenue = request.GrossRevenue;
            existingEntity.NetNJSRevenue = request.NetNJSRevenue;
            existingEntity.FollowUpComments = request.FollowUpComments;
            existingEntity.Notes = request.Notes;
            existingEntity.ProbableQualifyingCriteria = request.ProbableQualifyingCriteria;
            existingEntity.Operation = request.Operation;
            existingEntity.WorkName = request.WorkName;
            existingEntity.Client = request.Client;
            existingEntity.ClientSector = request.ClientSector;
            existingEntity.LikelyStartDate = request.LikelyStartDate;
            existingEntity.Status = request.Status;
            existingEntity.Currency = request.Currency;
            existingEntity.CapitalValue = request.CapitalValue;
            existingEntity.DurationOfProject = request.DurationOfProject;
            existingEntity.FundingStream = request.FundingStream;
            existingEntity.ContractType = request.ContractType;           
            existingEntity.UpdatedAt = DateTime.UtcNow;

            // Update in database
            await _repository.UpdateAsync(existingEntity);

            // Map to DTO
            return new OpportunityTrackingDto
            {
                Id = existingEntity.Id,                
                Stage = existingEntity.Stage,
                StrategicRanking = existingEntity.StrategicRanking,
                BidFees = existingEntity.BidFees,
                Emd = existingEntity.Emd,
                FormOfEMD = existingEntity.FormOfEMD,
                BidManagerId = existingEntity.BidManagerId,
                ReviewManagerId = existingEntity.ReviewManagerId,
                ApprovalManagerId = existingEntity.ApprovalManagerId,
                ContactPersonAtClient = existingEntity.ContactPersonAtClient,
                DateOfSubmission = existingEntity.DateOfSubmission,
                PercentageChanceOfProjectHappening = existingEntity.PercentageChanceOfProjectHappening,
                PercentageChanceOfNJSSuccess = existingEntity.PercentageChanceOfNJSSuccess,
                LikelyCompetition = existingEntity.LikelyCompetition,
                GrossRevenue = existingEntity.GrossRevenue,
                NetNJSRevenue = existingEntity.NetNJSRevenue,
                FollowUpComments = existingEntity.FollowUpComments,
                Notes = existingEntity.Notes,
                ProbableQualifyingCriteria = existingEntity.ProbableQualifyingCriteria,
                Operation = existingEntity.Operation,
                WorkName = existingEntity.WorkName,
                Client = existingEntity.Client,
                ClientSector = existingEntity.ClientSector,
                LikelyStartDate = existingEntity.LikelyStartDate,
                Status = existingEntity.Status,
                Currency = existingEntity.Currency,
                CapitalValue = existingEntity.CapitalValue,
                DurationOfProject = existingEntity.DurationOfProject,
                FundingStream = existingEntity.FundingStream,
                ContractType = existingEntity.ContractType                
            };
        }
    }
}

