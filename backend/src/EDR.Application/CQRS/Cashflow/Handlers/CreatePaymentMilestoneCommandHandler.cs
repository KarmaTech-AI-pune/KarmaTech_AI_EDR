using MediatR;
using EDR.Application.Dtos;
using EDR.Application.CQRS.Cashflow.Commands;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System;
using EDR.Repositories.Interfaces;
using EDR.Domain.Entities;

namespace EDR.Application.CQRS.Cashflow.Handlers
{
    public class CreatePaymentMilestoneCommandHandler : IRequestHandler<CreatePaymentMilestoneCommand, PaymentMilestoneDto>
    {
        private readonly IPaymentMilestoneRepository _repository;
        private readonly ILogger<CreatePaymentMilestoneCommandHandler> _logger;
        
        public CreatePaymentMilestoneCommandHandler(
            IPaymentMilestoneRepository repository,
            ILogger<CreatePaymentMilestoneCommandHandler> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<PaymentMilestoneDto> Handle(CreatePaymentMilestoneCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("CreatePaymentMilestoneCommandHandler: Creating payment milestone for ProjectId={ProjectId}", request.ProjectId);
            
            var entity = new PaymentMilestone
            {
                ProjectId = request.ProjectId,
                Description = request.Description,
                Percentage = request.Percentage,
                AmountINR = request.AmountINR,
                DueDate = request.DueDate,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = request.ChangedBy
            };

            var savedEntity = await _repository.AddAsync(entity);
            
            _logger.LogInformation("CreatePaymentMilestoneCommandHandler: Payment milestone created with Id={Id}", savedEntity.Id);

            return new PaymentMilestoneDto
            {
                Id = savedEntity.Id,
                Description = savedEntity.Description,
                Percentage = savedEntity.Percentage,
                AmountINR = savedEntity.AmountINR,
                DueDate = savedEntity.DueDate
            };
        }
    }
}
