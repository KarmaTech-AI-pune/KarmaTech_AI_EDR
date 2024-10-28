// File: src/NJSAPI/Repositories/ProjectRepository.cs
using NJSAPI.Interfaces;
using NJSAPI.Models;
using NJSAPI.Services;
using System;
using System.Collections.Generic;
using System.Linq;

namespace NJSAPI.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private static List<Project> _projects = new List<Project>
    {
        new Project { 
            Id = 1, 
            Name = "City Water Supply Upgrade", 
            ClientName = "Metropolis Municipality", 
            EstimatedCost = 5000000, 
            StartDate = new DateTime(2023, 1, 1), 
            EndDate = new DateTime(2024, 12, 31), 
            Status = "In Progress",
            Progress = 65
        },
        new Project { 
            Id = 2, 
            Name = "Rural Sanitation Initiative", 
            ClientName = "State Rural Development Dept", 
            EstimatedCost = 2000000, 
            StartDate = new DateTime(2023, 3, 15), 
            EndDate = new DateTime(2025, 3, 14), 
            Status = "Planning",
            Progress = 25
        },
        new Project { 
            Id = 3, 
            Name = "Industrial Park Drainage System", 
            ClientName = "Industrial Development Corp", 
            EstimatedCost = 3500000, 
            StartDate = new DateTime(2022, 7, 1), 
            EndDate = new DateTime(2023, 12, 31), 
            Status = "Completed",
            Progress = 100
        },
        new Project { 
            Id = 4, 
            Name = "Smart City Water Management", 
            ClientName = "Smart City Development Authority", 
            EstimatedCost = 7500000, 
            StartDate = new DateTime(2024, 1, 1), 
            EndDate = new DateTime(2026, 12, 31), 
            Status = "Planning",
            Progress = 15
        },
        new Project { 
            Id = 5, 
            Name = "Coastal Zone Protection", 
            ClientName = "Maritime Development Board", 
            EstimatedCost = 4500000, 
            StartDate = new DateTime(2023, 6, 1), 
            EndDate = new DateTime(2025, 5, 31), 
            Status = "In Progress",
            Progress = 45
        },
        new Project { 
            Id = 6, 
            Name = "Urban Flood Management", 
            ClientName = "City Municipal Corporation", 
            EstimatedCost = 3200000, 
            StartDate = new DateTime(2023, 8, 15), 
            EndDate = new DateTime(2024, 8, 14), 
            Status = "In Progress",
            Progress = 55
        }
    };

        public IEnumerable<Project> GetAll()
        {
            return _projects;
        }

        public Project GetById(int id)
        {
            return _projects.FirstOrDefault(p => p.Id == id);
        }

        public void Add(Project project)
        {
            project.Id = _projects.Max(p => p.Id) + 1;
            _projects.Add(project);
        }

        public void Update(Project project)
        {
            var existingProject = _projects.FirstOrDefault(p => p.Id == project.Id);
            if (existingProject != null)
            {
                existingProject.Name = project.Name;
                existingProject.ClientName = project.ClientName;
                existingProject.EstimatedCost = project.EstimatedCost;
                existingProject.StartDate = project.StartDate;
                existingProject.EndDate = project.EndDate;
                existingProject.Status = project.Status;
            }
        }

        public void Delete(int id)
        {
            var project = _projects.FirstOrDefault(p => p.Id == id);
            if (project != null)
            {
                _projects.Remove(project);
            }
        }
    }
}
