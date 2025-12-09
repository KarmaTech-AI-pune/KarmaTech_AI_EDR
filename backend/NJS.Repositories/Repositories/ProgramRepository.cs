using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NJS.Repositories.Interfaces; // Assuming IApplicationDbContext is defined here
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using NJS.Domain.Database;

namespace NJS.Repositories.Repositories
{
    public class ProgramRepository : IProgramRepository
    {
        private readonly ProjectManagementContext _context;

        public ProgramRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Program program, CancellationToken cancellationToken = default)
        {
            _context.Programs.Add(program);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateAsync(Program program, CancellationToken cancellationToken = default)
        {
            _context.Programs.Update(program);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var program = await _context.Programs.FindAsync(new object[] { id }, cancellationToken);
            if (program != null)
            {
                _context.Programs.Remove(program);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        public async Task<Program?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Programs.FindAsync(new object[] { id }, cancellationToken);
        }

        public async Task<IEnumerable<Program>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Programs.ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Project>> GetProjectsByProgramIdAsync(int programId, CancellationToken cancellationToken = default)
        {
            return await _context.Projects
                .Where(p => p.ProgramId == programId)
                .ToListAsync(cancellationToken);
        }
    }
}
