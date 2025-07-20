using System.Collections.Concurrent;

namespace NJS.Domain.Events
{
    public class AuditSubject : IAuditSubject
    {
        private readonly ConcurrentBag<IAuditObserver> _observers = new();

        public void Attach(IAuditObserver observer)
        {
            if (observer != null && !_observers.Contains(observer))
            {
                _observers.Add(observer);
            }
        }

        public void Detach(IAuditObserver observer)
        {
            if (observer != null)
            {
                var observersList = _observers.ToList();
                observersList.Remove(observer);
                _observers.Clear();
                foreach (var obs in observersList)
                {
                    _observers.Add(obs);
                }
            }
        }

        public async Task NotifyAsync(IAuditEvent auditEvent)
        {
            var tasks = _observers.Select(observer => observer.OnAuditEventAsync(auditEvent));
            await Task.WhenAll(tasks);
        }
    }
} 