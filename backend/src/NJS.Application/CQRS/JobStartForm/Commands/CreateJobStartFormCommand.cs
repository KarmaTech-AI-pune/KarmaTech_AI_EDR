using System;
using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.JobStartForm.Commands
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
