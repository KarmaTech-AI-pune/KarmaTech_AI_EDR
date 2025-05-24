using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
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
    public class ProjectClosureRepository : IProjectClosureRepository
    {
        private readonly IRepository<ProjectClosure> _repository;
        private readonly ProjectManagementContext _context;
        private readonly ILogger<ProjectClosureRepository> _logger;

        public ProjectClosureRepository(IRepository<ProjectClosure> repository, ProjectManagementContext context, ILogger<ProjectClosureRepository> logger)
        {
            _repository = repository;
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<ProjectClosure>> GetAll()
        {
            return await _repository.Query()
                .ToListAsync()
                .ConfigureAwait(false);
        }

        public async Task<ProjectClosure> GetById(int id)
        {
            return await _repository.Query()
                .FirstOrDefaultAsync(pc => pc.Id == id)
                .ConfigureAwait(false);
        }

        public async Task<ProjectClosure> GetByProjectId(int projectId)
        {
            return await _repository.Query()
                .FirstOrDefaultAsync(pc => pc.ProjectId == projectId)
                .ConfigureAwait(false);
        }

        public async Task<IEnumerable<ProjectClosure>> GetAllByProjectId(int projectId)
        {
            return await _repository.Query()
                .Where(pc => pc.ProjectId == projectId)
                .OrderByDescending(pc => pc.CreatedAt)
                .ToListAsync()
                .ConfigureAwait(false);
        }

        public async Task<bool> ProjectExists(int projectId)
        {
            var exists = await _context.Projects.AnyAsync(p => p.Id == projectId);
            _logger.LogInformation($"Checking if project with ID {projectId} exists: {exists}");

            if (!exists)
            {
                // Get all available project IDs for better error reporting
                var availableProjects = await _context.Projects
                    .OrderBy(p => p.Id)
                    .Select(p => new { p.Id, p.Name })
                    .Take(10)
                    .ToListAsync();

                _logger.LogInformation($"Available projects (showing first 10): {string.Join(", ", availableProjects.Select(p => $"{p.Id}:{p.Name}"))}");

                // If there are no projects at all, create a sample project
                if (!availableProjects.Any())
                {
                    _logger.LogInformation("No projects found in the database. This should not happen as there should be at least one sample project.");
                }
                else
                {
                    // Suggest using an available project ID
                    _logger.LogInformation($"Suggested project ID to use: {availableProjects.First().Id}");
                }
            }

            return exists;
        }

        public async Task Add(ProjectClosure projectClosure)
        {
            try
            {
                _logger.LogInformation($"Adding project closure for project ID {projectClosure.ProjectId}");

                // Check if the project exists
                if (!await ProjectExists(projectClosure.ProjectId))
                {
                    throw new InvalidOperationException($"Project with ID {projectClosure.ProjectId} does not exist");
                }

                // Check if a project closure already exists for this project
                var existingClosure = await GetByProjectId(projectClosure.ProjectId);
                if (existingClosure != null)
                {
                    _logger.LogInformation($"Project closure already exists for project ID {projectClosure.ProjectId} with ID {existingClosure.Id}");

                    // Set the ID to match the existing one so we update instead of creating a new entry
                    projectClosure.Id = existingClosure.Id;

                    // Preserve original creation metadata
                    projectClosure.CreatedAt = existingClosure.CreatedAt;
                    projectClosure.CreatedBy = existingClosure.CreatedBy;

                    // Set update metadata
                    projectClosure.UpdatedAt = DateTime.UtcNow;
                    projectClosure.UpdatedBy = projectClosure.UpdatedBy ?? "System";

                    // Update the existing entry instead of creating a new one
                    Update(projectClosure);

                    // Return early since we've handled the update
                    return;
                }

                // If no existing closure, create a new one
                // Explicitly set ID to 0 to ensure the database generates a new ID
                projectClosure.Id = 0;

                // Reset the identity seed to ensure we get the next available ID
                await ResetIdentitySeedAsync();

                _logger.LogInformation("Creating new project closure entry");

                // Ensure required fields are set
                if (string.IsNullOrEmpty(projectClosure.CreatedBy))
                {
                    projectClosure.CreatedBy = "System";
                }

                if (projectClosure.CreatedAt == default)
                {
                    projectClosure.CreatedAt = DateTime.UtcNow;
                }

                // Log all the values being saved
                await _repository.AddAsync(projectClosure).ConfigureAwait(false);
                await _repository.SaveChangesAsync().ConfigureAwait(false);

                _logger.LogInformation($"Successfully added project closure with ID {projectClosure.Id}");
            }
            catch (Exception ex)
            {
                _logger.LogInformation($"Error adding project closure: {ex.ToString()}");
                throw;
            }
        }

        public void Update(ProjectClosure projectClosure)
        {
            try
            {
                _logger.LogInformation($"Updating project closure with ID {projectClosure.Id}");

                // First, check if the entity exists
                var existingEntity = _repository.GetByIdAsync(projectClosure.Id).GetAwaiter().GetResult();
                if (existingEntity == null)
                {
                    throw new InvalidOperationException($"Project closure with ID {projectClosure.Id} not found");
                }

                // Log all the values being updated
                
                // Ensure required fields are set
                if (string.IsNullOrEmpty(projectClosure.CreatedBy))
                {
                    projectClosure.CreatedBy = "System";
                }

                if (projectClosure.CreatedAt == default)
                {
                    projectClosure.CreatedAt = DateTime.UtcNow;
                }

                if (projectClosure.UpdatedAt == null)
                {
                    projectClosure.UpdatedAt = DateTime.UtcNow;
                }

                // Explicitly detach any existing entity with the same ID
                var existingEntry = _context.Entry(existingEntity);
                if (existingEntry.State != EntityState.Detached)
                {
                    existingEntry.State = EntityState.Detached;
                }

                // Attach the updated entity and mark it as modified
                _context.Entry(projectClosure).State = EntityState.Modified;
                _context.SaveChanges();

                _logger.LogInformation($"Successfully updated project closure with ID {projectClosure.Id}");
            }
            catch (Exception ex)
            {
                _logger.LogInformation($"Error updating project closure: {ex.ToString()}");
                throw;
            }
        }

        public void Delete(int id)
        {
            try
            {
                // Validate ID - allow ID 0 since it's a valid ID in our system
                if (id < 0)
                {
                    throw new ArgumentException($"Invalid project closure ID: {id}. ID must be a non-negative number.");
                }

                _logger.LogInformation($"Attempting to delete project closure with ID {id}");

                // Use a transaction to ensure consistency
                using (var transaction = _context.Database.BeginTransaction())
                {
                    try
                    {
                        // First try direct SQL approach - most reliable and works for all IDs including 0
                        _logger.LogInformation($"Attempting to delete project closure with ID {id} using direct SQL");
                        var rowsAffected = _context.Database.ExecuteSqlRaw($"DELETE FROM ProjectClosures WHERE Id = {id}");
                        _logger.LogInformation($"Direct SQL delete affected {rowsAffected} rows");

                        if (rowsAffected > 0)
                        {
                            // Commit the transaction
                            transaction.Commit();
                            _logger.LogInformation($"Successfully deleted project closure with ID {id} using direct SQL");

                            // Reset identity seed after successful deletion
                            ResetIdentitySeedAsync().GetAwaiter().GetResult();
                            return;
                        }

                        // If direct SQL didn't work, try using Entity Framework
                        _logger.LogInformation($"Direct SQL didn't affect any rows, trying EF Core approach");

                        // Try to find the entity
                        var projectClosure = _context.Set<ProjectClosure>().Find(id);

                        if (projectClosure != null)
                        {
                            // Remove the entity using EF Core
                            _context.Set<ProjectClosure>().Remove(projectClosure);
                            var result = _context.SaveChanges();

                            _logger.LogInformation($"EF Core removal affected {result} rows");

                            if (result > 0)
                            {
                                // Commit the transaction
                                transaction.Commit();
                                _logger.LogInformation($"Successfully deleted project closure with ID {id} using EF Core");

                                // Reset identity seed after successful deletion
                                ResetIdentitySeedAsync().GetAwaiter().GetResult();
                                return;
                            }
                        }
                        else
                        {
                            _logger.LogInformation($"Project closure with ID {id} not found in database");

                            // For ID 0 or any ID that doesn't exist, consider it a success
                            // This ensures the API returns 200 OK
                            _logger.LogInformation($"Treating deletion as successful even though no entity was found");

                            // Commit the transaction (even though nothing was deleted)
                            transaction.Commit();
                            return;
                        }

                        // If we get here, neither approach worked
                        _logger.LogInformation($"Failed to delete project closure with ID {id}");
                        transaction.Rollback();
                    }
                    catch (Exception ex)
                    {
                        // Roll back the transaction on error
                        transaction.Rollback();
                        _logger.LogInformation($"Error during transaction, rolling back: {ex.Message}");
                        if (ex.InnerException != null)
                        {
                            _logger.LogInformation($"Inner exception: {ex.InnerException.Message}");
                        }
                        throw; // Re-throw to be handled by the caller
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogInformation($"Error deleting project closure with ID {id}: {ex.Message}");
                if (ex.InnerException != null)
                {
                    _logger.LogInformation($"Inner exception: {ex.InnerException.Message}");
                }
                throw;
            }
        }

        public async Task<bool> Exists(int projectId)
        {
            return await _repository.Query()
                .AnyAsync(pc => pc.ProjectId == projectId)
                .ConfigureAwait(false);
        }

        public async Task ResetIdentitySeedAsync()
        {
            try
            {
                // Check if there are any records left
                if (!await _repository.Query().AnyAsync())
                {
                    // Reset the identity seed to 1
                    await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('ProjectClosures', RESEED, 0)");
                    _logger.LogInformation("Reset ProjectClosures identity seed to 0");
                }
                else
                {
                    // Find the next available ID (look for gaps)
                    var allIds = await _repository.Query().Select(pc => pc.Id).OrderBy(id => id).ToListAsync();
                    int nextId = 1;

                    foreach (var id in allIds)
                    {
                        if (id != nextId)
                        {
                            break;
                        }
                        nextId++;
                    }

                    // Reset the identity seed to the next available ID - 1
                    await _context.Database.ExecuteSqlRawAsync($"DBCC CHECKIDENT ('ProjectClosures', RESEED, {nextId - 1})");
                    _logger.LogInformation($"Reset ProjectClosures identity seed to {nextId - 1}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogInformation($"Error resetting identity seed: {ex.Message}");
                // Don't throw the exception, just log it
            }
        }
    }
}
