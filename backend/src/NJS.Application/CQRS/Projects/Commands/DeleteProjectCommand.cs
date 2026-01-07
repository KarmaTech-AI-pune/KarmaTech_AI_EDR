using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Projects.Commands
{
    public class DeleteProjectCommand:IRequest<Unit>
    {
        public int Id { get; set; }
        public int? ProgramId { get; set; }
    }
}
