using MediatR;
using System.Collections.Generic;

namespace NJS.Application.Tests.CQRS.InputRegister.Queries
{
    public class GetAllInputRegistersQuery : IRequest<IEnumerable<InputRegisterDto>>
    {
        // No parameters needed for this query
    }
}
