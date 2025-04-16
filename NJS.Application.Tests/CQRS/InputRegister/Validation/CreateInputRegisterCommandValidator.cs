using FluentValidation;
using NJS.Application.Tests.CQRS.InputRegister.Commands;
using System;

namespace NJS.Application.Tests.CQRS.InputRegister.Validation
{
    public class CreateInputRegisterCommandValidator : AbstractValidator<CreateInputRegisterCommand>
    {
        public CreateInputRegisterCommandValidator()
        {
            RuleFor(x => x.ProjectId)
                .GreaterThan(0)
                .WithMessage("Invalid ProjectId");

            RuleFor(x => x.DataReceived)
                .NotEmpty()
                .WithMessage("DataReceived cannot be empty")
                .MaximumLength(255)
                .WithMessage("DataReceived must not exceed 255 characters");

            RuleFor(x => x.ReceiptDate)
                .NotEmpty()
                .WithMessage("ReceiptDate is required")
                .Must(date => date <= DateTime.Now)
                .WithMessage("ReceiptDate cannot be in the future");

            RuleFor(x => x.ReceivedFrom)
                .NotEmpty()
                .WithMessage("ReceivedFrom cannot be empty")
                .MaximumLength(255)
                .WithMessage("ReceivedFrom must not exceed 255 characters");

            RuleFor(x => x.FilesFormat)
                .NotEmpty()
                .WithMessage("FilesFormat cannot be empty")
                .MaximumLength(100)
                .WithMessage("FilesFormat must not exceed 100 characters");

            RuleFor(x => x.NoOfFiles)
                .GreaterThan(0)
                .WithMessage("NoOfFiles must be greater than 0");

            RuleFor(x => x.CheckedBy)
                .MaximumLength(255)
                .WithMessage("CheckedBy must not exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.CheckedBy));

            RuleFor(x => x.Custodian)
                .MaximumLength(255)
                .WithMessage("Custodian must not exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.Custodian));

            RuleFor(x => x.StoragePath)
                .MaximumLength(500)
                .WithMessage("StoragePath must not exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.StoragePath));

            RuleFor(x => x.Remarks)
                .MaximumLength(1000)
                .WithMessage("Remarks must not exceed 1000 characters")
                .When(x => !string.IsNullOrEmpty(x.Remarks));
        }
    }
}
