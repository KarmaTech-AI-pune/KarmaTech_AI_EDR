using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using EDR.Domain.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EDR.Domain
{
    public class AuditObserverInitializer : IHostedService
    {
        private readonly IServiceProvider _serviceProvider;

        public AuditObserverInitializer(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var auditSubject = scope.ServiceProvider.GetRequiredService<IAuditSubject>();
            var observers = scope.ServiceProvider.GetServices<IAuditObserver>();

            foreach (var observer in observers)
            {
                auditSubject.Attach(observer);
            }

            await Task.CompletedTask;
        }

        public async Task StopAsync(CancellationToken cancellationToken)
        {
            await Task.CompletedTask;
        }
    }
}

