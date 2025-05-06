using MediatR;
using NJS.Application.CQRS.InputRegister.Queries;
using NJS.Application.DTOs;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.InputRegister.Handlers
{
    public class GetInputRegisterByIdQueryHandler : IRequestHandler<GetInputRegisterByIdQuery, InputRegisterDto>
    {
        private readonly IInputRegisterRepository _repository;

        public GetInputRegisterByIdQueryHandler(IInputRegisterRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<InputRegisterDto> Handle(GetInputRegisterByIdQuery request, CancellationToken cancellationToken)
        {
            var inputRegister = await _repository.GetByIdAsync(request.Id);
            if (inputRegister == null)
            {
                return null;
            }

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
