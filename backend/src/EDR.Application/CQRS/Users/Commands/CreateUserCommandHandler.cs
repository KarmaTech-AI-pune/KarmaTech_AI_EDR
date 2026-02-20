using MediatR;
using Microsoft.AspNetCore.Identity;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Application.CQRS.Email.Notifications;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Users.Commands;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    private readonly UserManager<User> _userManager;
    private readonly IMediator _mediator;

    public CreateUserCommandHandler(
        UserManager<User> userManager,
        IMediator mediator)
    {
        _userManager = userManager;
        _mediator = mediator;
    }

    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var user = new User
        {
            UserName = request.UserName,
            Email = request.Email,
            Name = request.Name,
            StandardRate = request.StandardRate,
            IsConsultant = request.IsConsultant,
            Avatar = request.Avatar
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            throw new ApplicationException($"Failed to create user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        // Add roles
        if (request.Roles != null && request.Roles.Any())
        {
            foreach (var role in request.Roles)
            {
                await _userManager.AddToRoleAsync(user, role.Name);
            }
        }

        // Send welcome email
        await _mediator.Publish(new UserRegistrationEmailNotification(
            request.Email,
            request.UserName,
            request.Password
        ), cancellationToken);

        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            Name = user.Name,
            StandardRate = user.StandardRate ?? 0,
            IsConsultant = user.IsConsultant,
            Avatar = user.Avatar,
            Roles = request.Roles
        };
    }
}

