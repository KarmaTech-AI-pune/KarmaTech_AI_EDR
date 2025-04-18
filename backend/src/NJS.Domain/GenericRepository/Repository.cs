//File: backend/src/NJS.Domain/GenericRepository/Repository.cs
using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Domain.GenericRepository
{
    public class Repository<T> : IRepository<T> where T : class
    {
        private readonly ProjectManagementContext _context;
        private readonly DbSet<T> _dbSet;

        public Repository(ProjectManagementContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }
        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }

        public async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync().ConfigureAwait(false);


        public async Task<T?> GetByIdAsync(int? id)
        {
            return await _dbSet.FindAsync(id);
        }

        public IQueryable<T> Query() => _dbSet;


        public async Task RemoveAsync(T entity)
        {
            _dbSet.Remove(entity);
            await SaveChangesAsync();

        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync().ConfigureAwait(false);
        }

        public async Task UpdateAsync(T entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            await SaveChangesAsync();
        }
    }
}
