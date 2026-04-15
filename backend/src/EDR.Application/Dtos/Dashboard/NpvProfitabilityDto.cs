using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EDR.Application.Dtos.Dashboard
{
    public class NpvProfitabilityDto
    {
        public decimal CurrentNpv { get; set; }
        public decimal ExpectedRevenue { get; set; }
        public decimal ActualRevenue { get; set; }
        public string CurrencyCode { get; set; }
        public int HighProfitProjectsCount { get; set; }
        public int MediumProfitProjectsCount { get; set; }
        public int LowProfitProjectsCount { get; set; }
        public string WhatIfAnalysis { get; set; }
    }
}

