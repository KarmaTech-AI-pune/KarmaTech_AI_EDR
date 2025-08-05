using MediatR;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using NJS.Domain.Database;
using Microsoft.EntityFrameworkCore;
using System;

namespace NJS.Application.CQRS.CreateAccount
{
    public class DuplicateEmailException : Exception
    {
        public DuplicateEmailException(string email) : base($"An account with email '{email}' already exists.") { }
    }

    public class DuplicateSubdomainException : Exception
    {
        public DuplicateSubdomainException(string subdomain) : base($"An account with subdomain '{subdomain}' already exists.") { }
    }

    public class CreateAccountCommandHandler : IRequestHandler<CreateAccountCommand, bool>
    {
        private readonly ICreateAccountRepository _createAccountRepository;
        private readonly ILogger<CreateAccountCommandHandler> _logger;
        private readonly ProjectManagementContext _context;

        public CreateAccountCommandHandler(ICreateAccountRepository createAccountRepository, ILogger<CreateAccountCommandHandler> logger, ProjectManagementContext context)
        {
            _createAccountRepository = createAccountRepository;
            _logger = logger;
            _context = context;
        }

        public async Task<bool> Handle(CreateAccountCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Creating account for email: {Email}", request.CreateAccountDto.EmailAddress);

                // Validation: Check if account with this email already exists
                var emailExists = await _context.CreateAccounts
                    .AnyAsync(a => a.EmailAddress.ToLower() == request.CreateAccountDto.EmailAddress.ToLower(), cancellationToken);

                if (emailExists)
                {
                    _logger.LogWarning("Account creation failed - email already exists: {Email}", request.CreateAccountDto.EmailAddress);
                    throw new DuplicateEmailException(request.CreateAccountDto.EmailAddress);
                }

                // Validation: Check if account with this subdomain already exists
                var subdomainExists = await _context.CreateAccounts
                    .AnyAsync(a => a.Subdomain.ToLower() == request.CreateAccountDto.Subdomain.ToLower(), cancellationToken);

                if (subdomainExists)
                {
                    _logger.LogWarning("Account creation failed - subdomain already exists: {Subdomain}", request.CreateAccountDto.Subdomain);
                    throw new DuplicateSubdomainException(request.CreateAccountDto.Subdomain);
                }

                var account = new NJS.Domain.Entities.CreateAccount
                {
                    FirstName = request.CreateAccountDto.FirstName,
                    LastName = request.CreateAccountDto.LastName,
                    EmailAddress = request.CreateAccountDto.EmailAddress,
                    PhoneNumber = request.CreateAccountDto.PhoneNumber,
                    CompanyName = request.CreateAccountDto.CompanyName,
                    CompanyAddress = request.CreateAccountDto.CompanyAddress,
                    Subdomain = request.CreateAccountDto.Subdomain,
                    SubscriptionPlan = request.CreateAccountDto.SubscriptionPlan
                };

                var result = await _createAccountRepository.CreateAccountAsync(account);

                if (result)
                {
                    _logger.LogInformation("Account created successfully for email: {Email}", request.CreateAccountDto.EmailAddress);
                    return true;
                }
                else
                {
                    _logger.LogError("Account creation failed for email: {Email}", request.CreateAccountDto.EmailAddress);
                    return false;
                }
            }
            catch (DuplicateEmailException)
            {
                throw; // Re-throw to be handled by controller
            }
            catch (DuplicateSubdomainException)
            {
                throw; // Re-throw to be handled by controller
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while creating account for email: {Email}", request.CreateAccountDto.EmailAddress);
                throw; // Re-throw to be handled by controller
            }
        }
    }
}
