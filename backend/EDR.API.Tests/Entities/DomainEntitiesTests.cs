using EDR.Domain.Entities;
using EDR.Domain.Enums;
using System;
using System.Collections.Generic;
using Xunit;

namespace EDR.API.Tests.Entities
{
    public class DomainEntitiesTests
    {
        [Fact]
        public void BudgetTable_Properties_SetAndGet()
        {
            var entity = new BudgetTable
            {
                Id = 1,
                TenantId = 1,
                MonthlyProgressId = 1,
                MonthlyProgress = new MonthlyProgress(),
                OriginalBudget = new OriginalBudget(),
                CurrentBudgetInMIS = new CurrentBudgetInMIS(),
                PercentCompleteOnCosts = new PercentCompleteOnCosts()
            };

            Assert.Equal(1, entity.Id);
            Assert.Equal(1, entity.TenantId);
            Assert.Equal(1, entity.MonthlyProgressId);
            Assert.NotNull(entity.MonthlyProgress);
            Assert.NotNull(entity.OriginalBudget);
            Assert.NotNull(entity.CurrentBudgetInMIS);
            Assert.NotNull(entity.PercentCompleteOnCosts);
        }

        [Fact]
        public void ChangeOrder_Properties_SetAndGet()
        {
            var entity = new ChangeOrder
            {
                Id = 1,
                TenantId = 1,
                MonthlyProgressId = 1,
                MonthlyProgress = new MonthlyProgress(),
                ContractTotal = 100.0m,
                Cost = 80.0m,
                Fee = 20.0m,
                SummaryDetails = "Test Summary",
                Status = "Active"
            };

            Assert.Equal(1, entity.Id);
            Assert.Equal(1, entity.TenantId);
            Assert.Equal(1, entity.MonthlyProgressId);
            Assert.NotNull(entity.MonthlyProgress);
            Assert.Equal(100.0m, entity.ContractTotal);
            Assert.Equal(80.0m, entity.Cost);
            Assert.Equal(20.0m, entity.Fee);
            Assert.Equal("Test Summary", entity.SummaryDetails);
            Assert.Equal("Active", entity.Status);
        }

        [Fact]
        public void CreateAccount_Properties_SetAndGet()
        {
            var entity = new CreateAccount
            {
                Id = 1,
                FirstName = "John",
                LastName = "Doe",
                EmailAddress = "john.doe@example.com",
                PhoneNumber = "1234567890",
                CompanyName = "Test Company",
                CompanyAddress = "Test Address",
                Subdomain = "test",
                SubscriptionPlan = "Pro"
            };

            Assert.Equal(1, entity.Id);
            Assert.Equal("John", entity.FirstName);
            Assert.Equal("Doe", entity.LastName);
            Assert.Equal("john.doe@example.com", entity.EmailAddress);
            Assert.Equal("1234567890", entity.PhoneNumber);
            Assert.Equal("Test Company", entity.CompanyName);
            Assert.Equal("Test Address", entity.CompanyAddress);
            Assert.Equal("test", entity.Subdomain);
            Assert.Equal("Pro", entity.SubscriptionPlan);
        }

        [Fact]
        public void CTCEAC_Properties_SetAndGet()
        {
            var entity = new CTCEAC
            {
                Id = 1,
                TenantId = 1,
                MonthlyProgressId = 1,
                MonthlyProgress = new MonthlyProgress(),
                CtcODC = 10.0m,
                CtcStaff = 20.0m,
                CtcSubtotal = 30.0m,
                ActualctcODC = 11.0m,
                ActualCtcStaff = 21.0m,
                ActualCtcSubtotal = 32.0m,
                EacOdc = 12.0m,
                EacStaff = 22.0m,
                TotalEAC = 34.0m,
                GrossProfitPercentage = 15.0m
            };

            Assert.Equal(1, entity.Id);
            Assert.Equal(1, entity.TenantId);
            Assert.Equal(1, entity.MonthlyProgressId);
            Assert.NotNull(entity.MonthlyProgress);
            Assert.Equal(10.0m, entity.CtcODC);
            Assert.Equal(20.0m, entity.CtcStaff);
            Assert.Equal(30.0m, entity.CtcSubtotal);
            Assert.Equal(11.0m, entity.ActualctcODC);
            Assert.Equal(21.0m, entity.ActualCtcStaff);
            Assert.Equal(32.0m, entity.ActualCtcSubtotal);
            Assert.Equal(12.0m, entity.EacOdc);
            Assert.Equal(22.0m, entity.EacStaff);
            Assert.Equal(34.0m, entity.TotalEAC);
            Assert.Equal(15.0m, entity.GrossProfitPercentage);
        }

        [Fact]
        public void CurrentBudgetInMIS_Properties_SetAndGet()
        {
            var entity = new CurrentBudgetInMIS
            {
                Id = 1,
                TenantId = 1,
                BudgetTableId = 1,
                BudgetTable = new BudgetTable(),
                RevenueFee = 100.0m,
                Cost = 80.0m,
                ProfitPercentage = 20.0m
            };

            Assert.Equal(1, entity.Id);
            Assert.Equal(1, entity.TenantId);
            Assert.Equal(1, entity.BudgetTableId);
            Assert.NotNull(entity.BudgetTable);
            Assert.Equal(100.0m, entity.RevenueFee);
            Assert.Equal(80.0m, entity.Cost);
            Assert.Equal(20.0m, entity.ProfitPercentage);
        }

        [Fact]
        public void CurrentMonthAction_Properties_SetAndGet()
        {
            var date = DateTime.UtcNow;
            var entity = new CurrentMonthAction
            {
                Id = 1,
                TenantId = 1,
                MonthlyProgressId = 1,
                MonthlyProgress = new MonthlyProgress(),
                Actions = "Action 1",
                Date = date,
                Comments = "Comment 1",
                Priority = "High"
            };

            Assert.Equal(1, entity.Id);
            Assert.Equal(1, entity.TenantId);
            Assert.Equal(1, entity.MonthlyProgressId);
            Assert.NotNull(entity.MonthlyProgress);
            Assert.Equal("Action 1", entity.Actions);
            Assert.Equal(date, entity.Date);
            Assert.Equal("Comment 1", entity.Comments);
            Assert.Equal("High", entity.Priority);
        }

        [Fact]
        public void EarlyWarning_Properties_SetAndGet()
        {
            var entity = new EarlyWarning
            {
                Id = 1,
                TenantId = 1,
                MonthlyProgressId = 1,
                MonthlyProgress = new MonthlyProgress(),
                WarningsDescription = "Warning 1"
            };

            Assert.Equal(1, entity.Id);
            Assert.Equal(1, entity.TenantId);
            Assert.Equal(1, entity.MonthlyProgressId);
            Assert.NotNull(entity.MonthlyProgress);
            Assert.Equal("Warning 1", entity.WarningsDescription);
        }

        [Fact]
        public void GoNoGoDecisionOpportunity_Properties_SetAndGet()
        {
            var entity = new GoNoGoDecisionOpportunity
            {
                Id = 1,
                TenantId = 1,
                TypeOfBid = TypeOfBid.Lumpsum,
                Sector = "Sector 1",
                BdHead = "Head 1",
                Office = "Office 1",
                RegionalBDHead = "R Head 1",
                Region = "Region 1",
                TypeOfClient = "Client 1",
                EnderFee = "Fee 1",
                Emd = "Emd 1",
                OpportunityId = 1,
                ScoringCriteriaId = 1,
                ScoringCriterias = new ScoringCriteria(),
                ScoreRangeId = 1,
                ScoreRanges = new ScoreRange()
            };

            Assert.Equal(1, entity.Id);
            Assert.Equal(1, entity.TenantId);
            Assert.Equal(TypeOfBid.Lumpsum, entity.TypeOfBid);
            Assert.Equal("Sector 1", entity.Sector);
            Assert.Equal("Head 1", entity.BdHead);
            Assert.Equal("Office 1", entity.Office);
            Assert.Equal("R Head 1", entity.RegionalBDHead);
            Assert.Equal("Region 1", entity.Region);
            Assert.Equal("Client 1", entity.TypeOfClient);
            Assert.Equal("Fee 1", entity.EnderFee);
            Assert.Equal("Emd 1", entity.Emd);
            Assert.Equal(1, entity.OpportunityId);
            Assert.Equal(1, entity.ScoringCriteriaId);
            Assert.NotNull(entity.ScoringCriterias);
            Assert.Equal(1, entity.ScoreRangeId);
            Assert.NotNull(entity.ScoreRanges);
        }

        [Fact]
        public void GoNoGoDecisionTransaction_Properties_SetAndGet()
        {
            var now = DateTime.UtcNow;
            var entity = new GoNoGoDecisionTransaction
            {
                Id = 1,
                TenantId = 1,
                Score = 80,
                Commits = "Commit 1",
                GoNoGoDecisionHeaderId = 1,
                GoNoGoDecisionHeader = new GoNoGoDecisionHeader(),
                ScoringCriteriaId = 1,
                ScoringCriterias = new ScoringCriteria(),
                CreatedAt = now,
                UpdatedAt = now,
                UpdatedBy = "User 1",
                CreatedBy = "User 1"
            };

            Assert.Equal(1, entity.Id);
            Assert.Equal(1, entity.TenantId);
            Assert.Equal(80, entity.Score);
            Assert.Equal("Commit 1", entity.Commits);
            Assert.Equal(1, entity.GoNoGoDecisionHeaderId);
            Assert.NotNull(entity.GoNoGoDecisionHeader);
            Assert.Equal(1, entity.ScoringCriteriaId);
            Assert.NotNull(entity.ScoringCriterias);
            Assert.Equal(now, entity.CreatedAt);
            Assert.Equal(now, entity.UpdatedAt);
            Assert.Equal("User 1", entity.UpdatedBy);
            Assert.Equal("User 1", entity.CreatedBy);
        }

        [Fact]
        public void LastMonthAction_Properties_SetAndGet()
        {
            var date = DateTime.UtcNow;
            var entity = new LastMonthAction
            {
                Id = 1,
                TenantId = 1,
                MonthlyProgressId = 1,
                MonthlyProgress = new MonthlyProgress(),
                Actions = "Action 1",
                Date = date,
                Comments = "Comment 1"
            };

            Assert.Equal(1, entity.Id);
            Assert.Equal(1, entity.TenantId);
            Assert.Equal(1, entity.MonthlyProgressId);
            Assert.NotNull(entity.MonthlyProgress);
            Assert.Equal("Action 1", entity.Actions);
            Assert.Equal(date, entity.Date);
            Assert.Equal("Comment 1", entity.Comments);
        }

        [Fact]
        public void Limitations_Properties_SetAndGet()
        {
            var entity = new Limitations
            {
                Id = 1,
                SubscriptionPlanId = 1,
                SubscriptionPlan = new SubscriptionPlan(),
                UsersIncluded = "5",
                Projects = "10",
                StorageGB = "20",
                Support = "Email"
            };

            Assert.Equal(1, entity.Id);
            Assert.Equal(1, entity.SubscriptionPlanId);
            Assert.NotNull(entity.SubscriptionPlan);
            Assert.Equal("5", entity.UsersIncluded);
            Assert.Equal("10", entity.Projects);
            Assert.Equal("20", entity.StorageGB);
            Assert.Equal("Email", entity.Support);
        }

        [Fact]
        public void MigrationResult_Properties_SetAndGet()
        {
            var entity = new MigrationResult
            {
                Id = 1,
                TenantId = 1,
                Success = true,
                Message = "Success Message",
                TenantResults = new List<MigrationResult>()
            };

            Assert.Equal(1, entity.Id);
            Assert.Equal(1, entity.TenantId);
            Assert.True(entity.Success);
            Assert.Equal("Success Message", entity.Message);
            Assert.NotNull(entity.TenantResults);
        }

        [Fact]
        public void OpportunityStatus_Properties_SetAndGet()
        {
            var entity = new OpportunityStatus
            {
                Id = 1,
                TenantId = 1,
                Status = "Status 1",
                OpportunityHistories = new List<OpportunityHistory>()
            };

            Assert.Equal(1, entity.Id);
            Assert.Equal(1, entity.TenantId);
            Assert.Equal("Status 1", entity.Status);
            Assert.NotNull(entity.OpportunityHistories);
        }

        [Fact]
        public void OriginalBudget_Properties_SetAndGet()
        {
            var entity = new OriginalBudget
            {
                Id = 1,
                TenantId = 1,
                BudgetTableId = 1,
                BudgetTable = new BudgetTable(),
                RevenueFee = 100.0m,
                Cost = 80.0m,
                ProfitPercentage = 20.0m
            };

            Assert.Equal(1, entity.Id);
            Assert.Equal(1, entity.TenantId);
            Assert.Equal(1, entity.BudgetTableId);
            Assert.NotNull(entity.BudgetTable);
            Assert.Equal(100.0m, entity.RevenueFee);
            Assert.Equal(80.0m, entity.Cost);
            Assert.Equal(20.0m, entity.ProfitPercentage);
        }

        [Fact]
        public void PercentCompleteOnCosts_Properties_SetAndGet()
        {
            var entity = new PercentCompleteOnCosts
            {
                Id = 1,
                TenantId = 1,
                BudgetTableId = 1,
                BudgetTable = new BudgetTable(),
                RevenueFee = 100.0m,
                Cost = 80.0m
            };

            Assert.Equal(1, entity.Id);
            Assert.Equal(1, entity.TenantId);
            Assert.Equal(1, entity.BudgetTableId);
            Assert.NotNull(entity.BudgetTable);
            Assert.Equal(100.0m, entity.RevenueFee);
            Assert.Equal(80.0m, entity.Cost);
        }

        [Fact]
        public void Pricing_Properties_SetAndGet()
        {
            var entity = new Pricing
            {
                Id = 1,
                SubscriptionPlanId = 1,
                SubscriptionPlan = new SubscriptionPlan(),
                Type = "Monthly",
                Currency = "USD",
                Amount = 99.99m,
                Formatted = "$99.99"
            };

            Assert.Equal(1, entity.Id);
            Assert.Equal(1, entity.SubscriptionPlanId);
            Assert.NotNull(entity.SubscriptionPlan);
            Assert.Equal("Monthly", entity.Type);
            Assert.Equal("USD", entity.Currency);
            Assert.Equal(99.99m, entity.Amount);
            Assert.Equal("$99.99", entity.Formatted);
        }

        [Fact]
        public void ProgrammeSchedule_Properties_SetAndGet()
        {
            var entity = new ProgrammeSchedule
            {
                Id = 1,
                TenantId = 1,
                MonthlyProgressId = 1,
                MonthlyProgress = new MonthlyProgress(),
                ProgrammeDescription = "Schedule 1"
            };

            Assert.Equal(1, entity.Id);
            Assert.Equal(1, entity.TenantId);
            Assert.Equal(1, entity.MonthlyProgressId);
            Assert.NotNull(entity.MonthlyProgress);
            Assert.Equal("Schedule 1", entity.ProgrammeDescription);
        }
    }
}
