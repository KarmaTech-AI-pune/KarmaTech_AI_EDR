﻿using EDR.Domain.Entities;

namespace EDR.Repositories.Interfaces
{
    public interface IProjectClosureRepository
    {
        Task<IEnumerable<ProjectClosure>> GetAll();
        Task<ProjectClosure> GetById(int id);
        Task<ProjectClosure> GetByProjectId(int projectId);
        Task<IEnumerable<ProjectClosure>> GetAllByProjectId(int projectId);
        Task Add(ProjectClosure projectClosure);
        void Update(ProjectClosure projectClosure);
        void Delete(int id);
        Task<bool> Exists(int projectId);
        Task<bool> ProjectExists(int projectId);
        Task ResetIdentitySeedAsync();
    }
}

