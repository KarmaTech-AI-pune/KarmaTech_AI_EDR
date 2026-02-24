using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.JobStartForm.Commands
{
    public class AddJobStartFormCommand : IRequest<int>
    {
        public JobStartFormDto JobStartFormDto { get; set; } // Use JobStartFormDto

        public AddJobStartFormCommand(JobStartFormDto jobStartFormDto) // Use JobStartFormDto
        {
            JobStartFormDto = jobStartFormDto;
        }
    }
}

