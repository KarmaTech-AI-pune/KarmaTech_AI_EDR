using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NJS.Domain.Database;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Handlers.GoNoGoDecision
{
    public class CreateGoNoGoDecisionTransactionCommand : IRequest<int>
    {
        public int Score { get; set; }
        public string Commits { get; set; }
        public int? GoNoGoDecisionHeaderId { get; set; }
        public int? ScoringCriteriaId { get; set; }
        public string CreatedBy { get; set; }
    }

    public class CreateGoNoGoDecisionTransactionHandler : IRequestHandler<CreateGoNoGoDecisionTransactionCommand, int>
    {
        private readonly ProjectManagementContext _context;

        public CreateGoNoGoDecisionTransactionHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<int> Handle(CreateGoNoGoDecisionTransactionCommand request, CancellationToken cancellationToken)
        {
            var transaction = new GoNoGoDecisionTransaction
            {
                Score = request.Score,
                Commits = request.Commits,
                GoNoGoDecisionHeaderId = request.GoNoGoDecisionHeaderId,
                ScoringCriteriaId = request.ScoringCriteriaId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = request.CreatedBy,
                UpdatedBy = request.CreatedBy
            };

            _context.GoNoGoDecisionTransactions.Add(transaction);
            await _context.SaveChangesAsync(cancellationToken);

            return transaction.Id;
        }
    }
}
