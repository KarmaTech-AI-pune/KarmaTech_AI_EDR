﻿using EDR.Domain.GenericRepository;



namespace EDR.Domain.UnitWork
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<T> GetRepository<T>() where T : class;
      
        Task<int> SaveChangesAsync();
    }
}

