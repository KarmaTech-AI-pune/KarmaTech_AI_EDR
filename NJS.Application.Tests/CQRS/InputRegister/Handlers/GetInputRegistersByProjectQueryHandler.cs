using MediatR;
using NJS.Application.Tests.CQRS.InputRegister.Queries;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.Tests.CQRS.InputRegister.Handlers
{
    public class GetInputRegistersByProjectQueryHandler : IRequestHandler<GetInputRegistersByProjectQuery, IEnumerable<InputRegisterDto>>
    {
        private readonly IInputRegisterRepository _repository;

        public GetInputRegistersByProjectQueryHandler(IInputRegisterRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<IEnumerable<InputRegisterDto>> Handle(GetInputRegistersByProjectQuery request, CancellationToken cancellationToken)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var inputRegisters = await _repository.GetByProjectIdAsync(request.ProjectId);
            
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
