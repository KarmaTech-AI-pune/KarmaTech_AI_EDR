using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.JobStartForm.Commands
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

