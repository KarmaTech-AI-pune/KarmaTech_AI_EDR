using MediatR;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace NJS.Application.CQRS.CreateAccount
{
    public class CreateAccountCommandHandler : IRequestHandler<CreateAccountCommand, bool>
    {
        private readonly ICreateAccountRepository _createAccountRepository;
        private readonly ILogger<CreateAccountCommandHandler> _logger;

        public CreateAccountCommandHandler(ICreateAccountRepository createAccountRepository, ILogger<CreateAccountCommandHandler> logger)
        {
            _createAccountRepository = createAccountRepository;
            _logger = logger;
        }

        public async Task<bool> Handle(CreateAccountCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Creating account for email: {Email}", request.CreateAccountDto.EmailAddress);

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
            }
            else
            {
                _logger.LogError("Account creation failed for email: {Email}", request.CreateAccountDto.EmailAddress);
            }

            return result;
        }
    }
}
