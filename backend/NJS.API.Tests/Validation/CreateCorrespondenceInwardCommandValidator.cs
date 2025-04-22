using FluentValidation;
using NJS.Application.CQRS.Correspondence.Commands;
using System;

namespace NJS.API.Tests.Validation
{
    public class CreateCorrespondenceInwardCommandValidator : AbstractValidator<CreateCorrespondenceInwardCommand>
    {
        public CreateCorrespondenceInwardCommandValidator()
        {
            RuleFor(x => x.ProjectId)
                .GreaterThan(0)
                .WithMessage("Invalid ProjectId");

            RuleFor(x => x.IncomingLetterNo)
                .NotEmpty()
                .WithMessage("IncomingLetterNo cannot be empty")
                .MaximumLength(255)
                .WithMessage("IncomingLetterNo must not exceed 255 characters");

            RuleFor(x => x.LetterDate)
                .NotEmpty()
                .WithMessage("LetterDate is required")
                .Must(date => date <= DateTime.Now)
                .WithMessage("LetterDate cannot be in the future");

            RuleFor(x => x.NjsInwardNo)
                .NotEmpty()
                .WithMessage("NjsInwardNo cannot be empty")
                .MaximumLength(255)
                .WithMessage("NjsInwardNo must not exceed 255 characters");

            RuleFor(x => x.ReceiptDate)
                .NotEmpty()
                .WithMessage("ReceiptDate is required")
                .Must(date => date <= DateTime.Now)
                .WithMessage("ReceiptDate cannot be in the future");

            RuleFor(x => x.From)
                .NotEmpty()
                .WithMessage("From cannot be empty")
                .MaximumLength(255)
                .WithMessage("From must not exceed 255 characters");

            RuleFor(x => x.Subject)
                .NotEmpty()
                .WithMessage("Subject cannot be empty")
                .MaximumLength(500)
                .WithMessage("Subject must not exceed 500 characters");

            RuleFor(x => x.AttachmentDetails)
                .MaximumLength(500)
                .WithMessage("AttachmentDetails must not exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.AttachmentDetails));

            RuleFor(x => x.ActionTaken)
                .MaximumLength(500)
                .WithMessage("ActionTaken must not exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.ActionTaken));

            RuleFor(x => x.StoragePath)
                .MaximumLength(500)
                .WithMessage("StoragePath must not exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.StoragePath));

            RuleFor(x => x.Remarks)
                .MaximumLength(1000)
                .WithMessage("Remarks must not exceed 1000 characters")
                .When(x => !string.IsNullOrEmpty(x.Remarks));

            RuleFor(x => x.RepliedDate)
                .Must(date => date == null || date <= DateTime.Now)
                .WithMessage("RepliedDate cannot be in the future");
        }
    }
}
