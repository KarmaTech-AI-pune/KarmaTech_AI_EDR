using FluentValidation;
using NJS.Application.CQRS.Correspondence.Commands;
using System;

namespace NJS.API.Tests.Validation
{
    public class CreateCorrespondenceOutwardCommandValidator : AbstractValidator<CreateCorrespondenceOutwardCommand>
    {
        public CreateCorrespondenceOutwardCommandValidator()
        {
            RuleFor(x => x.ProjectId)
                .GreaterThan(0)
                .WithMessage("Invalid ProjectId");

            RuleFor(x => x.LetterNo)
                .NotEmpty()
                .WithMessage("LetterNo cannot be empty")
                .MaximumLength(255)
                .WithMessage("LetterNo must not exceed 255 characters");

            RuleFor(x => x.LetterDate)
                .NotEmpty()
                .WithMessage("LetterDate is required")
                .Must(date => date <= DateTime.Now)
                .WithMessage("LetterDate cannot be in the future");

            RuleFor(x => x.To)
                .NotEmpty()
                .WithMessage("To cannot be empty")
                .MaximumLength(255)
                .WithMessage("To must not exceed 255 characters");

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

            RuleFor(x => x.Acknowledgement)
                .MaximumLength(255)
                .WithMessage("Acknowledgement must not exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.Acknowledgement));
        }
    }
}
