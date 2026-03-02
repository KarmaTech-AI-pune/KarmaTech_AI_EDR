using MediatR;
using EDR.Application.DTOs;
using System.Collections.Generic;

namespace EDR.Application.CQRS.InputRegister.Queries
{
    public class GetAllInputRegistersQuery : IRequest<IEnumerable<InputRegisterDto>>
    {
    }
}

