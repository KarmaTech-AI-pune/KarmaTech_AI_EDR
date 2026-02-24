using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EDR.Domain.Enums
{
    public enum GoNoGoStatus
    {
        Green,  // GO - Proceed with proposal
        Amber,  // GO with action plan
        Red     // NO GO - Do not proceed
    }
}

