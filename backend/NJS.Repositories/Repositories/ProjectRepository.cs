using NJS.Domain.Entities;
using NJS.Domain.GenericRepository;
using NJS.Repositories.Interfaces;

namespace NJS.Repositories.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly IRepository<Project> _repository;
        private readonly IOpportunityTrackingRepository _opportunityTrackingRepository;
        private readonly IGoNoGoDecisionRepository _goNoGoDecisionRepository;

        public ProjectRepository(
            IRepository<Project> repository,
            IGoNoGoDecisionRepository goNoGoDecisionRepository)
        {
            _repository = repository;
            _goNoGoDecisionRepository = goNoGoDecisionRepository;
        }

        private static List<Project> _projects = new List<Project>
        {
            new Project {
                Id = 1,
                Name = "City Water Supply Upgrade",
                ClientName = "Metropolis Municipality",
                ClientSector = "Government",
                Sector = "Water",
                EstimatedCost = 5000000,
                StartDate = new DateTime(2023, 1, 1),
                EndDate = new DateTime(2024, 12, 31),
                Status = ProjectStatus.InProgress,
                Progress = 65,
                ContractType = "EPC",
                Currency = "INR",
                CreatedAt = new DateTime(2022, 12, 1),
                CreatedBy = "System"
            },
            new Project {
                Id = 2,
                Name = "Rural Sanitation Initiative",
                ClientName = "State Rural Development Dept",
                ClientSector = "Government",
                Sector = "Sanitation",
                EstimatedCost = 2000000,
                StartDate = new DateTime(2023, 3, 15),
                EndDate = new DateTime(2025, 3, 14),
                Status = ProjectStatus.Opportunity,
                Progress = 25,
                ContractType = "Design-Build",
                Currency = "INR",
                CreatedAt = new DateTime(2023, 2, 15),
                CreatedBy = "System"
            },
            new Project {
                Id = 3,
                Name = "Industrial Park Drainage System",
                ClientName = "Industrial Development Corp",
                ClientSector = "Private",
                Sector = "Industrial",
                EstimatedCost = 3500000,
                StartDate = new DateTime(2022, 7, 1),
                EndDate = new DateTime(2023, 12, 31),
                Status = ProjectStatus.Opportunity,
                Progress = 100,
                ContractType = "Turnkey",
                Currency = "INR",
                CreatedAt = new DateTime(2022, 6, 1),
                CreatedBy = "System"
            },
            new Project {
                Id = 4,
                Name = "Smart City Water Management",
                ClientName = "Smart City Development Authority",
                ClientSector = "Government",
                Sector = "Smart City",
                EstimatedCost = 7500000,
                Status = ProjectStatus.DecisionPending,
                Progress = 0,
                ContractType = "EPC",
                Currency = "INR",
                CreatedAt = new DateTime(2023, 11, 1),
                CreatedBy = "System"
            },
            new Project {
                Id = 5,
                Name = "Coastal Zone Protection",
                ClientName = "Maritime Development Board",
                ClientSector = "Government",
                Sector = "Coastal",
                EstimatedCost = 4500000,
                StartDate = new DateTime(2023, 6, 1),
                EndDate = new DateTime(2025, 5, 31),
                Status = ProjectStatus.Cancelled,
                Progress = 45,
                ContractType = "Design-Build",
                Currency = "INR",
                CreatedAt = new DateTime(2023, 5, 1),
                CreatedBy = "System"
            },
            new Project {
                Id = 6,
                Name = "Urban Flood Management",
                ClientName = "City Municipal Corporation",
                ClientSector = "Government",
                Sector = "Urban Infrastructure",
                EstimatedCost = 3200000,
                Status = ProjectStatus.DecisionPending,
                Progress = 0,
                ContractType = "EPC",
                Currency = "INR",
                CreatedAt = new DateTime(2023, 11, 15),
                CreatedBy = "System"
            },
            new Project {
                Id = 7,
                Name = "Pune City Water Supply Upgrade",
                ClientName = "Municipality",
                ClientSector = "Government",
                Sector = "Water",
                EstimatedCost = 600000,
                StartDate = new DateTime(2023, 1, 1),
                EndDate = new DateTime(2024, 12, 31),
                Status = ProjectStatus.InProgress,
                Progress = 65,
                ContractType = "EPC",
                Currency = "INR",
                CreatedAt = new DateTime(2022, 12, 1),
                CreatedBy = "System"
            },
            new Project {
                Id = 8,
                Name = "Rural Initiative",
                ClientName = "Maharashtra Rural Development Dept",
                ClientSector = "Government",
                Sector = "Sanitation",
                EstimatedCost = 2000000,
                StartDate = new DateTime(2023, 3, 15),
                EndDate = new DateTime(2025, 3, 14),
                Status = ProjectStatus.BidSubmitted,
                Progress = 25,
                ContractType = "Design-Build",
                Currency = "INR",
                CreatedAt = new DateTime(2023, 2, 15),
                CreatedBy = "System"
            },
            new Project {
                Id = 9,
                Name = "Industrial Park System",
                ClientName = "Industrial Development Corp",
                ClientSector = "Private",
                Sector = "Industrial",
                EstimatedCost = 3500000,
                StartDate = new DateTime(2022, 7, 1),
                EndDate = new DateTime(2023, 12, 31),
                Status = ProjectStatus.BidSubmitted,
                Progress = 100,
                ContractType = "Turnkey",
                Currency = "INR",
                CreatedAt = new DateTime(2022, 6, 1),
                CreatedBy = "System"
            },
            new Project {
                Id = 10,
                Name = "City Water Management 2",
                ClientName = "Smart City Development Authority",
                ClientSector = "Government",
                Sector = "Smart City",
                EstimatedCost = 7500000,
                Status = ProjectStatus.BidRejected,
                Progress = 0,
                ContractType = "EPC",
                Currency = "INR",
                CreatedAt = new DateTime(2023, 11, 1),
                CreatedBy = "System"
            },
            new Project {
                Id = 11,
                Name = "Coastal Protection 2",
                ClientName = "Maritime Development Board",
                ClientSector = "Government",
                Sector = "Coastal",
                EstimatedCost = 4500000,
                StartDate = new DateTime(2023, 6, 1),
                EndDate = new DateTime(2025, 5, 31),
                Status = ProjectStatus.BidAccepted,
                Progress = 45,
                ContractType = "Design-Build",
                Currency = "INR",
                CreatedAt = new DateTime(2023, 5, 1),
                CreatedBy = "System"
            },
            new Project {
                Id = 12,
                Name = "Urban Management",
                ClientName = "City Municipal Corporation",
                ClientSector = "Government",
                Sector = "Urban Infrastructure",
                EstimatedCost = 3200000,
                Status = ProjectStatus.BidAccepted,
                Progress = 0,
                ContractType = "EPC",
                Currency = "INR",
                CreatedAt = new DateTime(2023, 11, 15),
                CreatedBy = "System"
            },
            new Project {
                Id = 13,
                Name = "Urban Management 23",
                ClientName = "City Municipal Corporation",
                ClientSector = "Government",
                Sector = "Urban Infrastructure",
                EstimatedCost = 3900000,
                Status = ProjectStatus.Completed,
                Progress = 0,
                ContractType = "EPC",
                Currency = "INR",
                CreatedAt = new DateTime(2023, 11, 15),
                CreatedBy = "System"
            },
            new Project {
                Id = 14,
                Name = "Mega Industrial Park",
                ClientName = "State Industrial Development Corp",
                ClientSector = "Government",
                Sector = "Industrial",
                EstimatedCost = 12500000,
                Status = ProjectStatus.Opportunity,
                Progress = 0,
                ContractType = "EPC",
                Currency = "INR",
                CreatedAt = new DateTime(2023, 12, 1),
                CreatedBy = "System"  
            },
            new Project {
                Id = 15,
                Name = "Expressway Stormwater Drainage",
                ClientName = "National Highway Authority",
                ClientSector = "Government", 
                Sector = "Transportation",
                EstimatedCost = 7800000,
                Status = ProjectStatus.Opportunity,
                Progress = 0,
                ContractType = "Design-Build",
                Currency = "INR",
                CreatedAt = new DateTime(2023, 12, 5),
                CreatedBy = "System"
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

        public async Task Add(Project project)
        {
            //temporary dummy database addition
            project.Id = _projects.Max(p => p.Id) + 1;
            _projects.Add(project);
            
            /* when database is running
            await _repository.AddAsync(project).ConfigureAwait(false);
            await _repository.SaveChangesAsync().ConfigureAwait(false);
            */
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
                existingProject.Progress = project.Progress;
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
