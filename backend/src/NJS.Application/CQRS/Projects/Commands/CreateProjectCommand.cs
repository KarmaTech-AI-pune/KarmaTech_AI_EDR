using MediatR;
using NJS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Projects.Commands
{
    public record CreateProjectCommand: IRequest<int>
    {
        public string Name { get; set; }
        public string ClientName { get; set; }
        public string ClientSector { get; set; }
        public string Sector { get; set; }
        public decimal EstimatedCost { get; set; }
        public decimal? CapitalValue { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public ProjectStatus Status { get; set; }
        public int Progress { get; set; }
        public int? DurationInMonths { get; set; }
        public string FundingStream { get; set; }
        public string ContractType { get; set; }
        public string Currency { get; set; }
        public string CreatedBy { get; set; }
    }
}
