using NJS.Domain.Entities;

using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
{
    public interface IMeasurementUnitRepository
    {
        Task<MeasurementUnit> GetByIdAsync(int id, FormType formType);
        Task<IEnumerable<MeasurementUnit>> GetAllAsync(FormType formType);
        Task AddAsync(MeasurementUnit unit, FormType formType);
        Task UpdateAsync(MeasurementUnit unit, FormType formType);
        Task DeleteAsync(int id, FormType formType);
    }
}
