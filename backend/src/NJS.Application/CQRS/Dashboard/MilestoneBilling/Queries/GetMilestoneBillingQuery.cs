using MediatR;
using NJS.Application.Dtos.Dashboard;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Dashboard.MilestoneBilling.Queries
{
    public class GetMilestoneBillingQuery : IRequest<List<MilestoneBillingDto>>
    {
    }
}
