using MediatR;
using NJS.Application.DTOs;
using System.Collections.Generic;

namespace NJS.Application.CQRS.InputRegister.Queries
{
    public class GetAllInputRegistersQuery : IRequest<IEnumerable<InputRegisterDto>>
    {
    }
}
