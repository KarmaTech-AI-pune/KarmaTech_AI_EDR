using System;
using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.JobStartForm.Commands
{
    public class CreateJobStartFormCommand : IRequest<int>
    {
        public JobStartFormDto JobStartForm { get; }

        public CreateJobStartFormCommand(JobStartFormDto jobStartForm)
        {
            JobStartForm = jobStartForm ?? throw new ArgumentNullException(nameof(jobStartForm));
        }
    }
}

