using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
    public class UpdateWBSOptionCommand : IRequest<WBSOptionDto>
    {
        public int Id { get; set; }
        public string Label { get; set; }
        public int Level { get; set; }
        public string ParentValue { get; set; }
        public int FormType { get; set; }
    }
}
