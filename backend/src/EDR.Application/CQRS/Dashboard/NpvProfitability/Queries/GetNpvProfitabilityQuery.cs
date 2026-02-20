using MediatR;
using EDR.Application.Dtos.Dashboard;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Dashboard.NpvProfitability.Queries
{
    public class GetNpvProfitabilityQuery : IRequest<NpvProfitabilityDto>
    {
    }
}

