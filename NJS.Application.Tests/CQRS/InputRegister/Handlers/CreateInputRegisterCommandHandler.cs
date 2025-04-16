using MediatR;
using NJS.Application.Tests.CQRS.InputRegister.Commands;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.Tests.CQRS.InputRegister.Handlers
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
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var inputRegister = new Domain.Entities.InputRegister
            {
                ProjectId = request.ProjectId,
                DataReceived = request.DataReceived,
                ReceiptDate = request.ReceiptDate,
                ReceivedFrom = request.ReceivedFrom,
                FilesFormat = request.FilesFormat,
                NoOfFiles = request.NoOfFiles,
                FitForPurpose = request.FitForPurpose,
                Check = request.Check,
                CheckedBy = request.CheckedBy,
                CheckedDate = request.CheckedDate,
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
