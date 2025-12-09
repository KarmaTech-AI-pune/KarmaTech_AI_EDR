using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
{
    public interface IProgramRepository
    {
        Task AddAsync(Program program, CancellationToken cancellationToken = default);
        Task UpdateAsync(Program program, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
        Task<Program?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<Program>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<Project>> GetProjectsByProgramIdAsync(int programId, CancellationToken cancellationToken = default);
    }
}
