using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.Dtos;
using NJS.Application.Services;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.OpportunityTracking.Commands
{
    public class CreateOpportunityTrackingCommandHandler : IRequestHandler<CreateOpportunityTrackingCommand, OpportunityTrackingDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly ICurrentUserService _currentUserService;

        public CreateOpportunityTrackingCommandHandler(
            ProjectManagementContext context,
            ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<OpportunityTrackingDto> Handle(CreateOpportunityTrackingCommand request, CancellationToken cancellationToken)
        {
            var currentUserId = _currentUserService.GetCurrentUserId();
            var currentTime = DateTime.UtcNow;

            var opportunity = new Domain.Entities.OpportunityTracking
            {
                // Required fields
                StrategicRanking = request.StrategicRanking,
                Operation = request.Operation,
                WorkName = request.WorkName,
                Client = request.Client,
                ClientSector = request.ClientSector,
                Currency = request.Currency,
                FundingStream = request.FundingStream,
                ContractType = request.ContractType,
                
                // Optional fields with default values
                BidFees = request.BidFees ?? 0,
                Emd = request.Emd ?? 0,
                FormOfEMD = request.FormOfEMD,
                BidManagerId = request.BidManagerId,
                ReviewManagerId = request.ReviewManagerId,
                ApprovalManagerId = request.ApprovalManagerId,
                ContactPersonAtClient = request.ContactPersonAtClient,
                DateOfSubmission = request.DateOfSubmission,
                PercentageChanceOfProjectHappening = request.PercentageChanceOfProjectHappening,
                PercentageChanceOfNJSSuccess = request.PercentageChanceOfNJSSuccess,
                LikelyCompetition = request.LikelyCompetition,
                GrossRevenue = request.GrossRevenue ?? 0,
                NetNJSRevenue = request.NetNJSRevenue ?? 0,
                FollowUpComments = request.FollowUpComments,
                Notes = request.Notes,
                ProbableQualifyingCriteria = request.ProbableQualifyingCriteria,
                LikelyStartDate = request.LikelyStartDate,
                Stage = request.Stage,
                Status = request.Status,
                CapitalValue = request.CapitalValue,
                DurationOfProject = request.DurationOfProject,

                // Audit fields
                CreatedAt = currentTime,
                UpdatedAt = currentTime,
                CreatedBy = currentUserId,
                UpdatedBy = currentUserId
            };

            _context.OpportunityTrackings.Add(opportunity);
            await _context.SaveChangesAsync(cancellationToken);

            // Map to DTO
            return new OpportunityTrackingDto
            {
                Id = opportunity.Id,
                StrategicRanking = opportunity.StrategicRanking,
                Operation = opportunity.Operation,
                WorkName = opportunity.WorkName,
                Client = opportunity.Client,
                ClientSector = opportunity.ClientSector,
                Currency = opportunity.Currency,
                FundingStream = opportunity.FundingStream,
                ContractType = opportunity.ContractType,
                BidFees = opportunity.BidFees,
                Emd = opportunity.Emd,
                FormOfEMD = opportunity.FormOfEMD,
                BidManagerId = opportunity.BidManagerId,
                ReviewManagerId = opportunity.ReviewManagerId,
                ApprovalManagerId = opportunity.ApprovalManagerId,
                ContactPersonAtClient = opportunity.ContactPersonAtClient,
                DateOfSubmission = opportunity.DateOfSubmission,
                PercentageChanceOfProjectHappening = opportunity.PercentageChanceOfProjectHappening,
                PercentageChanceOfNJSSuccess = opportunity.PercentageChanceOfNJSSuccess,
                LikelyCompetition = opportunity.LikelyCompetition,
                GrossRevenue = opportunity.GrossRevenue,
                NetNJSRevenue = opportunity.NetNJSRevenue,
                FollowUpComments = opportunity.FollowUpComments,
                Notes = opportunity.Notes,
                ProbableQualifyingCriteria = opportunity.ProbableQualifyingCriteria,
                LikelyStartDate = opportunity.LikelyStartDate,
                Stage = opportunity.Stage,
                Status = opportunity.Status,
                CapitalValue = opportunity.CapitalValue,
                DurationOfProject = opportunity.DurationOfProject,
                CreatedAt = opportunity.CreatedAt,
                UpdatedAt = opportunity.UpdatedAt,
                CreatedBy = opportunity.CreatedBy,
                UpdatedBy = opportunity.UpdatedBy
            };
        }
    }
}
