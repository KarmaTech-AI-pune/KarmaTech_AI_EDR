using Amazon.Route53;
using Amazon.Route53.Model;
using NJS.Application.Services.IContract;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace NJS.Application.Services
{
    public class DNSManagementService : IDNSManagementService
    {
        private readonly IAmazonRoute53 _route53Client;
        private readonly ILogger<DNSManagementService> _logger;
        private readonly string _hostedZoneId;
        private readonly string _domainName;

        public DNSManagementService(
            IAmazonRoute53 route53Client,
            ILogger<DNSManagementService> logger,
            IConfiguration configuration)
        {
            _route53Client = route53Client;
            _logger = logger;
            _hostedZoneId = configuration["AWS:Route53:HostedZoneId"];
            _domainName = configuration["AWS:Route53:DomainName"];
        }

        public async Task<bool> CreateSubdomainAsync(string subdomain)
        {
            try
            {
                var changeRequest = new ChangeResourceRecordSetsRequest
                {
                    HostedZoneId = _hostedZoneId,
                    ChangeBatch = new ChangeBatch
                    {
                        Changes = new List<Change>
                        {
                            new Change
                            {
                                Action = ChangeAction.CREATE,
                                ResourceRecordSet = new ResourceRecordSet
                                {
                                    Name = $"{subdomain}.{_domainName}",
                                    Type = RRType.CNAME,
                                    TTL = 300,
                                    ResourceRecords = new List<ResourceRecord>
                                    {
                                        new ResourceRecord { Value = "your-app-load-balancer.amazonaws.com" }
                                    }
                                }
                            }
                        }
                    }
                };

                var response = await _route53Client.ChangeResourceRecordSetsAsync(changeRequest);
                _logger.LogInformation("Created subdomain {Subdomain} with change ID: {ChangeId}", subdomain, response.ChangeInfo.Id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating subdomain {Subdomain}", subdomain);
                return false;
            }
        }

        public async Task<bool> DeleteSubdomainAsync(string subdomain)
        {
            try
            {
                var changeRequest = new ChangeResourceRecordSetsRequest
                {
                    HostedZoneId = _hostedZoneId,
                    ChangeBatch = new ChangeBatch
                    {
                        Changes = new List<Change>
                        {
                            new Change
                            {
                                Action = ChangeAction.DELETE,
                                ResourceRecordSet = new ResourceRecordSet
                                {
                                    Name = $"{subdomain}.{_domainName}",
                                    Type = RRType.CNAME,
                                    TTL = 300,
                                    ResourceRecords = new List<ResourceRecord>
                                    {
                                        new ResourceRecord { Value = "your-app-load-balancer.amazonaws.com" }
                                    }
                                }
                            }
                        }
                    }
                };

                var response = await _route53Client.ChangeResourceRecordSetsAsync(changeRequest);
                _logger.LogInformation("Deleted subdomain {Subdomain} with change ID: {ChangeId}", subdomain, response.ChangeInfo.Id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting subdomain {Subdomain}", subdomain);
                return false;
            }
        }

        public async Task<bool> UpdateSubdomainAsync(string subdomain, string newTarget)
        {
            try
            {
                var changeRequest = new ChangeResourceRecordSetsRequest
                {
                    HostedZoneId = _hostedZoneId,
                    ChangeBatch = new ChangeBatch
                    {
                        Changes = new List<Change>
                        {
                            new Change
                            {
                                Action = ChangeAction.UPSERT,
                                ResourceRecordSet = new ResourceRecordSet
                                {
                                    Name = $"{subdomain}.{_domainName}",
                                    Type = RRType.CNAME,
                                    TTL = 300,
                                    ResourceRecords = new List<ResourceRecord>
                                    {
                                        new ResourceRecord { Value = newTarget }
                                    }
                                }
                            }
                        }
                    }
                };

                var response = await _route53Client.ChangeResourceRecordSetsAsync(changeRequest);
                _logger.LogInformation("Updated subdomain {Subdomain} to target {Target} with change ID: {ChangeId}", subdomain, newTarget, response.ChangeInfo.Id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating subdomain {Subdomain} to target {Target}", subdomain, newTarget);
                return false;
            }
        }

        public async Task<bool> ValidateSubdomainAsync(string subdomain)
        {
            try
            {
                // Check if subdomain already exists
                var listRequest = new ListResourceRecordSetsRequest
                {
                    HostedZoneId = _hostedZoneId,
                    StartRecordName = $"{subdomain}.{_domainName}",
                    MaxItems = "1"
                };

                var response = await _route53Client.ListResourceRecordSetsAsync(listRequest);
                var exists = response.ResourceRecordSets.Any(r => r.Name == $"{subdomain}.{_domainName}.");

                if (exists)
                {
                    _logger.LogWarning("Subdomain {Subdomain} already exists", subdomain);
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating subdomain {Subdomain}", subdomain);
                return false;
            }
        }
    }
} 