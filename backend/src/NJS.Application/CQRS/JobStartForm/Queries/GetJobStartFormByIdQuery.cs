using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.JobStartForm.Queries
{
    public class GetJobStartFormByIdQuery : IRequest<JobStartFormDto>
    {
        public int FormId { get; set; } // Changed from Id to FormId

        public GetJobStartFormByIdQuery(int formId) // Changed parameter name
        {
            FormId = formId;
        }
    }
}
