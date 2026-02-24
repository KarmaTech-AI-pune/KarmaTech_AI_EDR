using EDR.Application.Services.IContract;
using Microsoft.Extensions.Logging;

namespace EDR.Application.Services
{
    public class MockDNSManagementService : IDNSManagementService
    {
        private readonly ILogger<MockDNSManagementService> _logger;

        public MockDNSManagementService(ILogger<MockDNSManagementService> logger)
        {
            _logger = logger;
        }

        public Task<bool> CreateSubdomainAsync(string subdomain)
        {
            _logger.LogInformation("[MOCK DNS] Would create subdomain: {Subdomain}", subdomain);
            return Task.FromResult(true);
        }

        public Task<bool> DeleteSubdomainAsync(string subdomain)
        {
            _logger.LogInformation("[MOCK DNS] Would delete subdomain: {Subdomain}", subdomain);
            return Task.FromResult(true);
        }

        public Task<bool> UpdateSubdomainAsync(string subdomain, string newTarget)
        {
            _logger.LogInformation("[MOCK DNS] Would update subdomain: {Subdomain} to target: {Target}", subdomain, newTarget);
            return Task.FromResult(true);
        }

        public Task<bool> ValidateSubdomainAsync(string subdomain)
        {
            _logger.LogInformation("[MOCK DNS] Would validate subdomain: {Subdomain}", subdomain);
            // Mock validation - always return true for local testing
            return Task.FromResult(true);
        }
    }
} 
