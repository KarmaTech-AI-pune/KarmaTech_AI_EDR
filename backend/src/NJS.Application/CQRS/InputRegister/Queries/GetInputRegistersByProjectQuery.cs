using MediatR;
using NJS.Application.DTOs;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace NJS.Application.CQRS.InputRegister.Queries
{
    public class GetInputRegistersByProjectQuery : IRequest<IEnumerable<InputRegisterDto>>
    {
        [Required]
        public int ProjectId { get; set; }

        public GetInputRegistersByProjectQuery(int projectId)
        {
            ProjectId = projectId;
        }
    }
}
