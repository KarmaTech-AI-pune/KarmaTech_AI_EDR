using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;

namespace EDR.Repositories.Repositories
{
    public class SettingsRepository : ISettingsRepository
    {
        private readonly ProjectManagementContext _context;
        private const string BID_NUMBER_KEY = "BidNumberCounter";

        public SettingsRepository(ProjectManagementContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Settings> GetByKeyAsync(string key)
        {
            return await _context.Settings
                .Where(s => s.Key == key)
                .FirstOrDefaultAsync();
        }

        public async Task<Settings> UpdateAsync(Settings settings)
        {
            //settings.UpdatedAt = DateTime.UtcNow;
            _context.Settings.Update(settings);
            await _context.SaveChangesAsync();
            return settings;
        }

        public async Task<Settings> AddAsync(Settings settings)
        {
            var now = DateTime.Now;
            //settings.CreatedAt = now;
            //settings.UpdatedAt = now;

            _context.Settings.Add(settings);
            await _context.SaveChangesAsync();
            return settings;
        }

        public async Task<int> GetNextBidNumberAsync()
        {
            var bidNumberSetting = await GetByKeyAsync(BID_NUMBER_KEY);

            if (bidNumberSetting == null)
            {
                // Initialize with 1 if not exists
                bidNumberSetting = new Settings
                {
                    Key = BID_NUMBER_KEY,
                    Value = "1",
                    Description = "Counter for generating bid numbers"
                };
                await AddAsync(bidNumberSetting);
                return 1;
            }

            // Parse current value, increment, and update
            if (int.TryParse(bidNumberSetting.Value, out int currentValue))
            {
                int nextValue = currentValue + 1;
                bidNumberSetting.Value = nextValue.ToString();
                await UpdateAsync(bidNumberSetting);
                return nextValue;
            }

            // Fallback if parsing fails
            bidNumberSetting.Value = "1";
            await UpdateAsync(bidNumberSetting);
            return 1;
        }
    }
}
