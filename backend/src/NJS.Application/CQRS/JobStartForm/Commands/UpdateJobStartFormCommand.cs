using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.JobStartForm.Commands
{
    public class UpdateJobStartFormCommand : IRequest
    {
        public JobStartFormDto JobStartFormDto { get; set; } // Use JobStartFormDto

        public UpdateJobStartFormCommand(JobStartFormDto jobStartFormDto) // Use JobStartFormDto
        {
            JobStartFormDto = jobStartFormDto;
        }
    }
}
