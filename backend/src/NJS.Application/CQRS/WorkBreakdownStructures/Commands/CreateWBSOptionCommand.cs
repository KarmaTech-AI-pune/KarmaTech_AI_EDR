using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
    public class CreateWBSOptionCommand : IRequest<WBSOptionDto>
    {
        public string Value { get; set; }
        public string Label { get; set; }
        public int Level { get; set; }
        public string ParentValue { get; set; }
        public int FormType { get; set; }
    }
}
