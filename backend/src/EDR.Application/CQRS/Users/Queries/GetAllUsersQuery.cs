using System.Collections.Generic;
using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.Users.Queries
{
    public class GetAllUsersQuery : IRequest<IEnumerable<UserDto>>
    {
        public string? RoleFilter { get; set; }
        public bool? IsConsultantFilter { get; set; }
        public int? PageNumber { get; set; } = 1;
        public int? PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; }
        public string? SortBy { get; set; }
        public bool IsAscending { get; set; } = true;

        public GetAllUsersQuery()
        {
        }

        public GetAllUsersQuery(
            string? roleFilter = null,
            bool? isConsultantFilter = null,
            int? pageNumber = null,
            int? pageSize = null,
            string? searchTerm = null,
            string? sortBy = null,
            bool isAscending = true)
        {
            RoleFilter = roleFilter;
            IsConsultantFilter = isConsultantFilter;
            PageNumber = pageNumber;
            PageSize = pageSize;
            SearchTerm = searchTerm;
            SortBy = sortBy;
            IsAscending = isAscending;
        }
    }
}

