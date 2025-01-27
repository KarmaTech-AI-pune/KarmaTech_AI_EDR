using System.Collections.Generic;
using MediatR;
using NJS.Application.Dtos;
using NJS.Domain.Enums;

namespace NJS.Application.CQRS.OpportunityTracking.Queries
{
    public class GetAllOpportunityTrackingsQuery : IRequest<IEnumerable<OpportunityTrackingDto>>
    {
        public OpportunityTrackingStatus? Status { get; set; }
        public OpportunityStage? Stage { get; set; }
        public string? BidManagerId { get; set; }
        public string? ClientSector { get; set; }      
        
        // Pagination
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;

        // Sorting
        public string? SortBy { get; set; }
        public bool IsAscending { get; set; } = true;

        public GetAllOpportunityTrackingsQuery()
        {
        }

        public GetAllOpportunityTrackingsQuery(
            OpportunityTrackingStatus? status = null,
            OpportunityStage? stage = null,
            string? bidManagerId = null,
            string? clientSector = null,
            int pageNumber = 1,
            int pageSize = 10,
            string? sortBy = null,
            bool isAscending = true )
        {
            Status = status;
            Stage = stage;
            BidManagerId = bidManagerId;
            ClientSector = clientSector;
            PageNumber = pageNumber;
            PageSize = pageSize;
            SortBy = sortBy;
            IsAscending = isAscending;          
        }
    }
}
