using MediatR;
using NJS.Application.CQRS.InputRegister.Queries;
using NJS.Application.DTOs;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.InputRegister.Handlers
{
    public class GetAllInputRegistersQueryHandler : IRequestHandler<GetAllInputRegistersQuery, IEnumerable<InputRegisterDto>>
    {
        private readonly IInputRegisterRepository _repository;

        public GetAllInputRegistersQueryHandler(IInputRegisterRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<IEnumerable<InputRegisterDto>> Handle(GetAllInputRegistersQuery request, CancellationToken cancellationToken)
        {
            var inputRegisters = await _repository.GetAllAsync();
            
            return inputRegisters.Select(ir => new InputRegisterDto
            {
                Id = ir.Id,
                ProjectId = ir.ProjectId,
                DataReceived = ir.DataReceived,
                ReceiptDate = ir.ReceiptDate,
                ReceivedFrom = ir.ReceivedFrom,
                FilesFormat = ir.FilesFormat,
                NoOfFiles = ir.NoOfFiles,
                FitForPurpose = ir.FitForPurpose,
                Check = ir.Check,
                CheckedBy = ir.CheckedBy,
                CheckedDate = ir.CheckedDate,
                Custodian = ir.Custodian,
                StoragePath = ir.StoragePath,
                Remarks = ir.Remarks,
                CreatedBy = ir.CreatedBy,
                CreatedAt = ir.CreatedAt,
                UpdatedBy = ir.UpdatedBy,
                UpdatedAt = ir.UpdatedAt
            });
        }
    }
}
