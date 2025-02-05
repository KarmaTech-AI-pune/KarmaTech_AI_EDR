using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
{
    public interface IGoNoGoRepository
    {
        Task<GoNoGoDecisionOpportunity> GetByIdAsync(int opportunityId);
    }
}
