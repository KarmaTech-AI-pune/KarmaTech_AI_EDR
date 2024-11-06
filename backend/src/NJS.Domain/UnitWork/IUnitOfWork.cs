//File: backend/src/NJS.Domain/UnitWork/IUnitOfWork.cs
using NJS.Domain.GenericRepository;

namespace NJS.Domain.UnitWork
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<T> GetRepository<T>() where T : class;
        Task<int> SaveChangesAsync();
    }
}
