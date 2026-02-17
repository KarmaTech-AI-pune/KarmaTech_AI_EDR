using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EDR.Domain.Entities;

namespace EDR.Repositories.Interfaces
{
    public interface IGoNoGoRepository
    {
        Task<GoNoGoDecisionOpportunity> GetByIdAsync(int opportunityId);
    }
}

