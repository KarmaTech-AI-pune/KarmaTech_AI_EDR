//File: backend/src/NJS.Domain/UnitWork/UnitOfWork.cs
using NJS.Domain.Database;
using NJS.Domain.GenericRepository;
using System;
using System.Threading.Tasks;

namespace NJS.Domain.UnitWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ProjectManagementContext _context;
        private bool _disposed = false;
       

        public UnitOfWork(ProjectManagementContext context)
        {
            _context = context;
           
        }

        public IRepository<T> GetRepository<T>() where T : class
        {
            return new Repository<T>(_context);
        }

        

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _context.Dispose();
                }
            }
            _disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
