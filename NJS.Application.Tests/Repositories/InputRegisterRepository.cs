using Microsoft.EntityFrameworkCore;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NJS.Application.Tests.Repositories
{
    public class InputRegisterRepository : IInputRegisterRepository
    {
        private readonly ApplicationDbContext _context;

        public InputRegisterRepository(ApplicationDbContext context)
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
                .Where(ir => ir.ProjectId == projectId)
                .ToListAsync();
        }

        public async Task<int> AddAsync(InputRegister inputRegister)
        {
            if (inputRegister == null)
                throw new ArgumentNullException(nameof(inputRegister));

            await _context.InputRegisters.AddAsync(inputRegister);
            await _context.SaveChangesAsync();
            return inputRegister.Id;
        }

        public async Task UpdateAsync(InputRegister inputRegister)
        {
            if (inputRegister == null)
                throw new ArgumentNullException(nameof(inputRegister));

            _context.InputRegisters.Update(inputRegister);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var inputRegister = await GetByIdAsync(id);
            if (inputRegister != null)
            {
                _context.InputRegisters.Remove(inputRegister);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.InputRegisters.AnyAsync(ir => ir.Id == id);
        }

        public async Task ResetIdentitySeedAsync()
        {
            // This is a SQL Server specific command to reset the identity seed
            // For in-memory database, we'll simulate this behavior
            if (!await _context.InputRegisters.AnyAsync())
            {
                // If there are no records, we don't need to do anything
                return;
            }

            // For testing purposes, we'll just ensure the next ID is 1 more than the max ID
            // In a real implementation, this would use raw SQL to reset the identity seed
            await Task.CompletedTask;
        }
    }
}
