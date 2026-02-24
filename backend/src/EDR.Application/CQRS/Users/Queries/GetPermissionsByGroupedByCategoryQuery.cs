using MediatR;
using EDR.Application.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Users.Queries
{
    public class GetPermissionsByGroupedByCategoryQuery : IRequest<List<PermissionCategoryGroup>>
    {
        public GetPermissionsByGroupedByCategoryQuery()
        {

        }
    }
}

