using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.CreateAccount;
using NJS.Application.DTOs;
using System.Threading.Tasks;

namespace NJSAPI.Controllers
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
                return BadRequest("Account creation failed");
            }
        }
    }
}
