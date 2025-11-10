using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

namespace NJS.Repositories.Repositories
{
    public class InputRegisterRepository : IInputRegisterRepository
    {
        private readonly ProjectManagementContext _context;

        public InputRegisterRepository(ProjectManagementContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<InputRegister>> GetAllAsync()
        {
            return await _context.InputRegisters.ToListAsync();
        }

        public async Task<InputRegister> GetByIdAsync(int id)
        {
            return await _context.InputRegisters.FindAsync(id);
        }

        public async Task<IEnumerable<InputRegister>> GetByProjectIdAsync(int projectId)
        {
            return await _context.InputRegisters
                .Where(i => i.ProjectId == projectId)
                .OrderByDescending(i => i.ReceiptDate)
                .ToListAsync();
        }

        public async Task<int> AddAsync(InputRegister inputRegister)
        {
            if (inputRegister == null) throw new ArgumentNullException(nameof(inputRegister));

            inputRegister.CreatedAt = DateTime.Now;

            _context.InputRegisters.Add(inputRegister);
            await _context.SaveChangesAsync();

            return inputRegister.Id;
        }

        public async Task UpdateAsync(InputRegister inputRegister)
        {
            if (inputRegister == null) throw new ArgumentNullException(nameof(inputRegister));

            inputRegister.UpdatedAt = DateTime.Now;

            _context.Entry(inputRegister).State = EntityState.Modified;
            // Prevent changing the creation date
            _context.Entry(inputRegister).Property(x => x.CreatedAt).IsModified = false;
            _context.Entry(inputRegister).Property(x => x.CreatedBy).IsModified = false;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var inputRegister = await _context.InputRegisters.FindAsync(id);
            if (inputRegister != null)
            {
                _context.InputRegisters.Remove(inputRegister);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.InputRegisters.AnyAsync(i => i.Id == id);
        }

        public async Task<int> GetNextIdAsync()
        {
            // If there are no records, the next ID will be 1
            if (!await _context.InputRegisters.AnyAsync())
            {
                return 1;
            }

            // Otherwise, get the maximum ID and add 1
            var maxId = await _context.InputRegisters.MaxAsync(i => i.Id);
            return maxId + 1;
        }

        public async Task ResetIdentitySeedAsync()
        {
            // Check if there are any records left
            if (!await _context.InputRegisters.AnyAsync())
            {
                // Reset the identity seed to 1
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('InputRegisters', RESEED, 0)");
            }
            else
            {
                // Get the minimum available ID
                var minId = await _context.InputRegisters.MinAsync(i => i.Id);
                if (minId > 1)
                {
                    // Reset the identity seed to start from 1
                    await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('InputRegisters', RESEED, 0)");
                }
                else
                {
                    // Find the next available ID (look for gaps)
                    var allIds = await _context.InputRegisters.Select(i => i.Id).OrderBy(id => id).ToListAsync();
                    int nextId = 1;

                    foreach (var id in allIds)
                    {
                        if (id != nextId)
                        {
                            break;
                        }

                        nextId++;
                    }

                    // Reset the identity seed to the next available ID - 1
                    await _context.Database.ExecuteSqlRawAsync(
                        $"DBCC CHECKIDENT ('InputRegisters', RESEED, {nextId - 1})");
                }
            }
        }
    }
}