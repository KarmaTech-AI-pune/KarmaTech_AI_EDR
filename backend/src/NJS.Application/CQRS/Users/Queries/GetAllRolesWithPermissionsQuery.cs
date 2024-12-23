using MediatR;
using NJS.Application.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Users.Queries
{
    public class GetAllRolesWithPermissionsQuery: IRequest<IList<RoleDefination>>
    {
        public GetAllRolesWithPermissionsQuery()
        {
                
        }
    }
}
