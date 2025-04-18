using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.GenericRepository;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NJS.Repositories.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly IRepository<Project> _repository;
        private readonly IGoNoGoDecisionRepository _goNoGoDecisionRepository;

        public ProjectRepository(
            IRepository<Project> repository,
            IGoNoGoDecisionRepository goNoGoDecisionRepository)
        {
            _repository = repository;
            _goNoGoDecisionRepository = goNoGoDecisionRepository;
        }

        public async Task<IEnumerable<Project>> GetAll()
        {
            return  await _repository.GetAllAsync().ConfigureAwait(false);
        }

        public Project GetById(int id)
        {
            return _repository.GetByIdAsync(id).GetAwaiter().GetResult();
        }

        public async Task Add(Project project)
        {
            // Log the project being added
            Console.WriteLine($"Adding new project: {project.Name}");

            // Add the project to the repository
            await _repository.AddAsync(project).ConfigureAwait(false);
            await _repository.SaveChangesAsync().ConfigureAwait(false);

            // Log the ID assigned to the project
            Console.WriteLine($"Project added with ID: {project.Id}");
        }

        public void Update(Project project)
        {
            try
            {
                // Log the project state before update
                Console.WriteLine($"Repository - Project state before update:");
                Console.WriteLine($"Office: '{project.Office}'");
                Console.WriteLine($"TypeOfJob: '{project.TypeOfJob}'");
                Console.WriteLine($"Budget: {project.Budget}");
                Console.WriteLine($"Priority: '{project.Priority}'");

                _repository.UpdateAsync(project).GetAwaiter().GetResult();
                _repository.SaveChangesAsync().GetAwaiter().GetResult();

                // Log the project state after update
                var updatedProject = _repository.GetByIdAsync(project.Id).GetAwaiter().GetResult();
                Console.WriteLine($"Repository - Project state after update:");
                Console.WriteLine($"Office: '{updatedProject.Office}'");
                Console.WriteLine($"TypeOfJob: '{updatedProject.TypeOfJob}'");
                Console.WriteLine($"Budget: {updatedProject.Budget}");
                Console.WriteLine($"Priority: '{updatedProject.Priority}'");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in repository update: {ex.Message}");
                throw;
            }
        }

        public bool Delete(int id)
        {
            try
            {
                var project = _repository.GetByIdAsync(id).GetAwaiter().GetResult();
                if (project != null)
                {
                    // Log the project being deleted
                    Console.WriteLine($"Deleting project with ID {id}, Name: {project.Name}");

                    try
                    {
                        // Get the DbContext to handle related entities
                        var dbContext = _repository.GetDbContext() as ProjectManagementContext;
                        if (dbContext != null)
                        {
                            // Check for related entities and log them
                            var inputRegisters = dbContext.InputRegisters.Where(ir => ir.ProjectId == id).ToList();
                            Console.WriteLine($"Found {inputRegisters.Count} InputRegisters related to project {id}");

                            var jobStartForms = dbContext.JobStartForms.Where(jsf => jsf.ProjectId == id).ToList();
                            Console.WriteLine($"Found {jobStartForms.Count} JobStartForms related to project {id}");

                            var wbsItems = dbContext.WorkBreakdownStructures.Where(wbs => wbs.ProjectId == id).ToList();
                            Console.WriteLine($"Found {wbsItems.Count} WorkBreakdownStructures related to project {id}");

                            var feasibilityStudies = dbContext.FeasibilityStudies.Where(fs => fs.ProjectId == id).ToList();
                            Console.WriteLine($"Found {feasibilityStudies.Count} FeasibilityStudies related to project {id}");

                            var goNoGoDecisions = dbContext.GoNoGoDecisions.Where(gng => gng.ProjectId == id).ToList();
                            Console.WriteLine($"Found {goNoGoDecisions.Count} GoNoGoDecisions related to project {id}");

                            // Get project resources (need to use the navigation property)
                            var projectResources = project.ProjectResources?.ToList() ?? new List<ProjectResource>();
                            Console.WriteLine($"Found {projectResources.Count} ProjectResources related to project {id}");

                            // Remove related entities first (if needed - should be handled by cascade delete)
                            // But we'll explicitly remove them to be safe
                            if (inputRegisters.Any())
                            {
                                Console.WriteLine("Removing related InputRegisters...");
                                dbContext.InputRegisters.RemoveRange(inputRegisters);
                            }

                            if (jobStartForms.Any())
                            {
                                Console.WriteLine("Removing related JobStartForms...");
                                dbContext.JobStartForms.RemoveRange(jobStartForms);
                            }

                            if (wbsItems.Any())
                            {
                                Console.WriteLine("Removing related WorkBreakdownStructures...");
                                dbContext.WorkBreakdownStructures.RemoveRange(wbsItems);
                            }

                            if (feasibilityStudies.Any())
                            {
                                Console.WriteLine("Removing related FeasibilityStudies...");
                                dbContext.FeasibilityStudies.RemoveRange(feasibilityStudies);
                            }

                            if (goNoGoDecisions.Any())
                            {
                                Console.WriteLine("Removing related GoNoGoDecisions...");
                                dbContext.GoNoGoDecisions.RemoveRange(goNoGoDecisions);
                            }

                            if (projectResources.Any())
                            {
                                Console.WriteLine("Removing related ProjectResources...");
                                dbContext.Set<ProjectResource>().RemoveRange(projectResources);
                            }

                            // Save changes to remove related entities
                            dbContext.SaveChanges();
                            Console.WriteLine("Related entities removed successfully");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error removing related entities: {ex.Message}");
                        // Continue with project deletion attempt
                    }

                    // Now perform hard delete of the project
                    _repository.RemoveAsync(project).GetAwaiter().GetResult();
                    _repository.SaveChangesAsync().GetAwaiter().GetResult();

                    Console.WriteLine($"Successfully deleted project with ID {id}");
                    return true; // Project found and deleted
                }
                else
                {
                    // If project doesn't exist, log it and return false
                    Console.WriteLine($"Project with ID {id} not found, cannot delete");
                    return false; // Project not found
                }
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error deleting project with ID {id}: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                    Console.WriteLine($"Inner stack trace: {ex.InnerException.StackTrace}");
                }
                throw; // Rethrow to be handled by the caller
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            var project = await _repository.GetByIdAsync(id).ConfigureAwait(false);
            return project != null;
        }

        public async Task<int> GetNextAvailableIdAsync()
        {
            // Get all projects and their IDs
            var query = _repository.Query();
            var allIds = await query.Select(p => p.Id).OrderBy(id => id).ToListAsync().ConfigureAwait(false);

            // If there are no projects, start with ID 1
            if (allIds.Count == 0)
            {
                return 1;
            }

            // Find the first gap in the sequence
            int expectedId = 1;
            foreach (var id in allIds)
            {
                if (id != expectedId)
                {
                    // Found a gap, return this ID
                    Console.WriteLine($"Found gap in project IDs at {expectedId}");
                    return expectedId;
                }
                expectedId++;
            }

            // No gaps found, return the next ID in sequence
            Console.WriteLine($"No gaps found, next project ID will be {expectedId}");
            return expectedId;
        }

        public async Task ResetIdentitySeedAsync()
        {
            try
            {
                // Get the next available ID
                int nextId = await GetNextAvailableIdAsync().ConfigureAwait(false);

                // Get the DbContext from the repository
                var dbContext = _repository.GetDbContext() as ProjectManagementContext;
                if (dbContext != null)
                {
                    // First check if there are any projects
                    var projectCount = await dbContext.Projects.CountAsync().ConfigureAwait(false);

                    if (projectCount == 0)
                    {
                        // If no projects, reset to 0 so next ID will be 1
                        await dbContext.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('Projects', RESEED, 0)").ConfigureAwait(false);
                        Console.WriteLine("Identity seed for Projects table reset to 0 (empty table)");
                    }
                    else
                    {
                        // Reset the identity seed to nextId - 1
                        await dbContext.Database.ExecuteSqlRawAsync($"DBCC CHECKIDENT ('Projects', RESEED, {nextId - 1})").ConfigureAwait(false);
                        Console.WriteLine($"Identity seed for Projects table reset to {nextId - 1}");

                        // Verify the reset worked by checking the current identity value
                        // First, get the current identity value
                        var identityQuery = "SELECT IDENT_CURRENT('Projects') AS CurrentIdentity";
                        var currentIdentity = await dbContext.Database.SqlQueryRaw<decimal>(identityQuery).FirstOrDefaultAsync().ConfigureAwait(false);
                        Console.WriteLine($"Current identity value for Projects table: {currentIdentity}");

                        // Then run DBCC CHECKIDENT with NORESEED to verify
                        var result = await dbContext.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('Projects', NORESEED)").ConfigureAwait(false);
                        Console.WriteLine($"Identity check completed with result: {result}");
                    }
                }
                else
                {
                    Console.WriteLine("Could not get DbContext from repository");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error resetting identity seed: {ex.Message}");
                throw;
            }
        }
    }
}
