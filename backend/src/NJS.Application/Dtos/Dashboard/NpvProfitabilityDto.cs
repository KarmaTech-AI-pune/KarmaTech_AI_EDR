using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Application.Dtos.Dashboard
{
    public class NpvProfitabilityDto
    {
        public decimal CurrentNpv { get; set; }
        public int HighProfitProjectsCount { get; set; }
        public int MediumProfitProjectsCount { get; set; }
        public int LowProfitProjectsCount { get; set; }
        public string WhatIfAnalysis { get; set; }
    }
}
