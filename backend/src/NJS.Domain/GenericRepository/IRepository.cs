namespace NJS.Domain.GenericRepository
{
    public interface IRepository<T>
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<T?> GetByIdAsync(int? id);
        Task AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task RemoveAsync(T entity);
        IQueryable<T> Query();

        Task<int> SaveChangesAsync();
    }

}
