using System.ComponentModel;

namespace NJS.Domain.Entities
{
    public enum ProjectStatus
    {
        [Description("Opportunity")]
        Opportunity = 0,
        
        [Description("Active")]
        Active = 1,
        
        [Description("In Progress")]
        InProgress = 1, // Alias for Active
        
        [Description("Completed")]
        Completed = 2,
        
        [Description("On Hold")]
        OnHold = 3,
        
        [Description("Cancelled")]
        Cancelled = 4
    }
}
