using MediatR;
using NJS.Application.CQRS.InputRegister.Commands;
using NJS.Application.DTOs;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.InputRegister.Handlers
{
    public class UpdateInputRegisterCommandHandler : IRequestHandler<UpdateInputRegisterCommand, InputRegisterDto>
    {
        private readonly IInputRegisterRepository _repository;

        public UpdateInputRegisterCommandHandler(IInputRegisterRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<InputRegisterDto> Handle(UpdateInputRegisterCommand request, CancellationToken cancellationToken)
        {
            var inputRegister = await _repository.GetByIdAsync(request.Id);
            if (inputRegister == null)
            {
                throw new Exception($"Input Register with ID {request.Id} not found.");
            }

            // Update properties
            inputRegister.ProjectId = request.ProjectId;
            inputRegister.DataReceived = request.DataReceived;
            inputRegister.ReceiptDate = request.ReceiptDate;
            inputRegister.ReceivedFrom = request.ReceivedFrom;
            inputRegister.FilesFormat = request.FilesFormat;
            inputRegister.NoOfFiles = request.NoOfFiles;
            inputRegister.FitForPurpose = request.FitForPurpose;
            inputRegister.Check = request.Check;
            inputRegister.CheckedBy = request.CheckedBy;
            inputRegister.CheckedDate = request.CheckedDate;
            inputRegister.Custodian = request.Custodian;
            inputRegister.StoragePath = request.StoragePath;
            inputRegister.Remarks = request.Remarks;
            inputRegister.UpdatedBy = request.UpdatedBy;
            inputRegister.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(inputRegister);

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
                CreatedAt = inputRegister.CreatedAt,
                UpdatedBy = inputRegister.UpdatedBy,
                UpdatedAt = inputRegister.UpdatedAt
            };
        }
    }
}
