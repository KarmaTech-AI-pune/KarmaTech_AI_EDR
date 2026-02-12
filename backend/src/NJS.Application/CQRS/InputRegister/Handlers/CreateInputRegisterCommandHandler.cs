using MediatR;
using NJS.Application.CQRS.InputRegister.Commands;
using NJS.Application.DTOs;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.InputRegister.Handlers
{
    public class CreateInputRegisterCommandHandler : IRequestHandler<CreateInputRegisterCommand, InputRegisterDto>
    {
        private readonly IInputRegisterRepository _repository;

        public CreateInputRegisterCommandHandler(IInputRegisterRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<InputRegisterDto> Handle(CreateInputRegisterCommand request, CancellationToken cancellationToken)
        {
            var inputRegister = new Domain.Entities.InputRegister
            {
                ProjectId = request.ProjectId,
                DataReceived = request.DataReceived,
                ReceiptDate = DateTime.SpecifyKind(request.ReceiptDate, DateTimeKind.Utc),
                ReceivedFrom = request.ReceivedFrom,
                FilesFormat = request.FilesFormat,
                NoOfFiles = request.NoOfFiles,
                FitForPurpose = request.FitForPurpose,
                Check = request.Check,
                CheckedBy = request.CheckedBy,
                CheckedDate = request.CheckedDate.HasValue ? DateTime.SpecifyKind(request.CheckedDate.Value, DateTimeKind.Utc) : null,
                Custodian = request.Custodian,
                StoragePath = request.StoragePath,
                Remarks = request.Remarks,
                CreatedBy = request.CreatedBy,
                CreatedAt = DateTime.UtcNow
            };

            var id = await _repository.AddAsync(inputRegister);
            inputRegister.Id = id;

            return new InputRegisterDto
            {
                Id = inputRegister.Id,
                ProjectId = inputRegister.ProjectId,
                DataReceived = inputRegister.DataReceived,
                ReceiptDate = inputRegister.ReceiptDate,
                ReceivedFrom = inputRegister.ReceivedFrom,
                FilesFormat = inputRegister.FilesFormat,
                NoOfFiles = inputRegister.NoOfFiles,
                FitForPurpose = inputRegister.FitForPurpose,
                Check = inputRegister.Check,
                CheckedBy = inputRegister.CheckedBy,
                CheckedDate = inputRegister.CheckedDate,
                Custodian = inputRegister.Custodian,
                StoragePath = inputRegister.StoragePath,
                Remarks = inputRegister.Remarks,
                CreatedBy = inputRegister.CreatedBy,
                CreatedAt = inputRegister.CreatedAt
            };
        }
    }
}
