using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.CreateAccount;
using EDR.Application.DTOs;
using System.Threading.Tasks;
using System;

namespace EDR.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CreateAccountController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<CreateAccountController> _logger;

        public CreateAccountController(IMediator mediator, ILogger<CreateAccountController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CreateAccount([FromBody] CreateAccountDto createAccountDto)
        {
            try
            {
                _logger.LogInformation("Received signup request for email: {Email}", createAccountDto.EmailAddress);

                var command = new CreateAccountCommand { CreateAccountDto = createAccountDto };
                var result = await _mediator.Send(command);

                if (result)
                {
                    _logger.LogInformation("Account created successfully for email: {Email}", createAccountDto.EmailAddress);
                    return CreatedAtAction(nameof(CreateAccount), new { email = createAccountDto.EmailAddress }, createAccountDto);
                }
                else
                {
                    _logger.LogError("Account creation failed for email: {Email}", createAccountDto.EmailAddress);
                    return BadRequest(new { message = "Account creation failed" });
                }
            }
            catch (DuplicateEmailException ex)
            {
                _logger.LogWarning("Account creation failed - email already exists: {Email}", createAccountDto.EmailAddress);
                return Conflict(new { message = ex.Message, errorType = "EmailExists" });
            }
            catch (DuplicateSubdomainException ex)
            {
                _logger.LogWarning("Account creation failed - subdomain already exists: {Subdomain}", createAccountDto.Subdomain);
                return Conflict(new { message = ex.Message, errorType = "SubdomainExists" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while creating account for email: {Email}", createAccountDto.EmailAddress);
                return StatusCode(500, new { message = "An unexpected error occurred while creating the account." });
            }
        }
    }
}

