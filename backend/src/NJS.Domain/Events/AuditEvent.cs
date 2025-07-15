using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Domain.Events
{
    public class AuditEvent : IAuditEvent
    {
        public string EntityName { get; set; }

        public string Action { get; set; }
        public string EntityId { get; set; }
        public string OldValues { get; set; }
        public string NewValues { get; set; }
        public string ChangedBy { get; set; }
        public DateTime ChangedAt { get; set; }
        public string Reason { get; set; }
        public string IpAddress { get; set; }
        public string UserAgent { get; set; }

        public AuditEvent(string entityName, string action, string entityId, string oldValues, string newValues, string changedBy, DateTime changedAt, string reason = null, string ipAddress = null, string userAgent = null)
        {
            EntityName = entityName;
            Action = action;
            EntityId = entityId;
            OldValues = oldValues;
            NewValues = newValues;
            ChangedBy = changedBy;
            ChangedAt = changedAt;
            Reason = reason;
            IpAddress = ipAddress;
            UserAgent = userAgent;
        }
    }
}
