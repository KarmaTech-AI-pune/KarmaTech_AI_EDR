using EDR.Domain.Database;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;

namespace EDR.Repositories.Repositories
{
    public class MeasurementUnitRepository : IMeasurementUnitRepository
    {
        private readonly ProjectManagementContext _context;

        public MeasurementUnitRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<MeasurementUnit> GetByIdAsync(int id, FormType formType)
        {
            return await _context.MeasurementUnits.FirstOrDefaultAsync(u => u.Id == id && u.FormType == formType);
        }

        public async Task<IEnumerable<MeasurementUnit>> GetAllAsync(FormType formType)
        {
            return await _context.MeasurementUnits
                .Where(u => u.FormType == formType)
                .ToListAsync();
        }

        public async Task AddAsync(MeasurementUnit unit, FormType formType)
        {
            unit.FormType = formType;
            await _context.MeasurementUnits.AddAsync(unit);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(MeasurementUnit unit, FormType formType)
        {
            unit.FormType = formType;
            _context.MeasurementUnits.Update(unit);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id, FormType formType)
        {
            var unit = await _context.MeasurementUnits.FirstOrDefaultAsync(u => u.Id == id && u.FormType == formType);
            if (unit == null)
            {
                throw new Exception($"Unit with ID {id} and FormType {formType} not found.");
            }

            _context.MeasurementUnits.Remove(unit);
            await _context.SaveChangesAsync();
        }
    }
}

