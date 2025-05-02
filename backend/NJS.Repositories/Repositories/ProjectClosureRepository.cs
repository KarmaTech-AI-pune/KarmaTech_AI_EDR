﻿using Microsoft.EntityFrameworkCore;
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

        public ProjectClosureRepository(IRepository<ProjectClosure> repository, ProjectManagementContext context)
        {
            _repository = repository;
            _context = context;
        }

        public async Task<IEnumerable<ProjectClosure>> GetAll()
        {
            return await _repository.Query()
                // Removed Comments include to fix build issues
                //.Include(pc => pc.Comments)
                .ToListAsync()
                .ConfigureAwait(false);
        }

        public async Task<ProjectClosure> GetById(int id)
        {
            return await _repository.Query()
                // Removed Comments include to fix build issues
                //.Include(pc => pc.Comments)
                .FirstOrDefaultAsync(pc => pc.Id == id)
                .ConfigureAwait(false);
        }

        public async Task<ProjectClosure> GetByProjectId(int projectId)
        {
            return await _repository.Query()
                // Removed Comments include to fix build issues
                //.Include(pc => pc.Comments)
                .FirstOrDefaultAsync(pc => pc.ProjectId == projectId)
                .ConfigureAwait(false);
        }

        public async Task<IEnumerable<ProjectClosure>> GetAllByProjectId(int projectId)
        {
            return await _repository.Query()
                // Removed Comments include to fix build issues
                //.Include(pc => pc.Comments)
                .Where(pc => pc.ProjectId == projectId)
                .OrderByDescending(pc => pc.CreatedAt)
                .ToListAsync()
                .ConfigureAwait(false);
        }

        public async Task<bool> ProjectExists(int projectId)
        {
            var exists = await _context.Projects.AnyAsync(p => p.Id == projectId);
            Console.WriteLine($"Checking if project with ID {projectId} exists: {exists}");

            if (!exists)
            {
                // Get all available project IDs for better error reporting
                var availableProjects = await _context.Projects
                    .OrderBy(p => p.Id)
                    .Select(p => new { p.Id, p.Name })
                    .Take(10)
                    .ToListAsync();

                Console.WriteLine($"Available projects (showing first 10): {string.Join(", ", availableProjects.Select(p => $"{p.Id}:{p.Name}"))}");

                // If there are no projects at all, create a sample project
                if (!availableProjects.Any())
                {
                    Console.WriteLine("No projects found in the database. This should not happen as there should be at least one sample project.");
                }
                else
                {
                    // Suggest using an available project ID
                    Console.WriteLine($"Suggested project ID to use: {availableProjects.First().Id}");
                }
            }

            return exists;
        }

        public async Task Add(ProjectClosure projectClosure)
        {
            try
            {
                Console.WriteLine($"Adding project closure for project ID {projectClosure.ProjectId}");

                // Check if the project exists
                if (!await ProjectExists(projectClosure.ProjectId))
                {
                    throw new InvalidOperationException($"Project with ID {projectClosure.ProjectId} does not exist");
                }

                // Always force the database to generate a new ID
                // Explicitly set ID to 0 to ensure the database generates a new ID
                projectClosure.Id = 0;

                // Reset the identity seed to ensure we get the next available ID
                await ResetIdentitySeedAsync();

                Console.WriteLine("Forcing database to generate a new ID for project closure");

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
                Console.WriteLine($"Saving project closure with values:");
                Console.WriteLine($"  ID: {projectClosure.Id}");
                Console.WriteLine($"  ProjectId: {projectClosure.ProjectId}");
                Console.WriteLine($"  ClientFeedback: {projectClosure.ClientFeedback}");
                Console.WriteLine($"  SuccessCriteria: {projectClosure.SuccessCriteria}");
                Console.WriteLine($"  BudgetEstimate: {projectClosure.BudgetEstimate}");
                Console.WriteLine($"  PlanningIssues: {projectClosure.PlanningIssues}");
                Console.WriteLine($"  PlanningLessons: {projectClosure.PlanningLessons}");
                Console.WriteLine($"  Positives: {projectClosure.Positives}");
                Console.WriteLine($"  LessonsLearned: {projectClosure.LessonsLearned}");
                Console.WriteLine($"  AsBuiltManuals: {projectClosure.AsBuiltManuals}");
                Console.WriteLine($"  AsBuiltManualsValue: {projectClosure.AsBuiltManualsValue}");
                Console.WriteLine($"  BriefAims: {projectClosure.BriefAims}");
                Console.WriteLine($"  ClientPayment: {projectClosure.ClientPayment}");
                Console.WriteLine($"  ConstructabilityReview: {projectClosure.ConstructabilityReview}");
                Console.WriteLine($"  ConstructionInvolvement: {projectClosure.ConstructionInvolvement}");
                Console.WriteLine($"  ConstructionInvolvementValue: {projectClosure.ConstructionInvolvementValue}");
                Console.WriteLine($"  ConstructionOther: {projectClosure.ConstructionOther}");
                Console.WriteLine($"  DesignReviewOutputs: {projectClosure.DesignReviewOutputs}");
                Console.WriteLine($"  Efficiencies: {projectClosure.Efficiencies}");
                Console.WriteLine($"  EfficienciesValue: {projectClosure.EfficienciesValue}");
                Console.WriteLine($"  HealthSafetyConcerns: {projectClosure.HealthSafetyConcerns}");
                Console.WriteLine($"  HealthSafetyConcernsValue: {projectClosure.HealthSafetyConcernsValue}");
                Console.WriteLine($"  Hindrances: {projectClosure.Hindrances}");
                Console.WriteLine($"  HsFileForwarded: {projectClosure.HsFileForwarded}");
                Console.WriteLine($"  HsFileForwardedValue: {projectClosure.HsFileForwardedValue}");
                Console.WriteLine($"  MaintenanceAgreements: {projectClosure.MaintenanceAgreements}");
                Console.WriteLine($"  MaintenanceAgreementsValue: {projectClosure.MaintenanceAgreementsValue}");
                Console.WriteLine($"  OperationalRequirements: {projectClosure.OperationalRequirements}");
                Console.WriteLine($"  OperationalRequirementsValue: {projectClosure.OperationalRequirementsValue}");
                Console.WriteLine($"  PlanUseful: {projectClosure.PlanUseful}");
                Console.WriteLine($"  ProgrammeRealistic: {projectClosure.ProgrammeRealistic}");
                Console.WriteLine($"  ProgrammeRealisticValue: {projectClosure.ProgrammeRealisticValue}");
                Console.WriteLine($"  ProgrammeUpdates: {projectClosure.ProgrammeUpdates}");
                Console.WriteLine($"  ProgrammeUpdatesValue: {projectClosure.ProgrammeUpdatesValue}");
                Console.WriteLine($"  RequiredQuality: {projectClosure.RequiredQuality}");
                Console.WriteLine($"  RequiredQualityValue: {projectClosure.RequiredQualityValue}");
                Console.WriteLine($"  TechnoLegalIssues: {projectClosure.TechnoLegalIssues}");
                Console.WriteLine($"  Variations: {projectClosure.Variations}");
                Console.WriteLine($"  CreatedBy: {projectClosure.CreatedBy}");
                Console.WriteLine($"  CreatedAt: {projectClosure.CreatedAt}");

                await _repository.AddAsync(projectClosure).ConfigureAwait(false);
                await _repository.SaveChangesAsync().ConfigureAwait(false);

                Console.WriteLine($"Successfully added project closure with ID {projectClosure.Id}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding project closure: {ex.ToString()}");
                throw;
            }
        }

        public void Update(ProjectClosure projectClosure)
        {
            try
            {
                Console.WriteLine($"Updating project closure with ID {projectClosure.Id}");

                // Log all the values being updated
                Console.WriteLine($"Updating project closure with values:");
                Console.WriteLine($"  ID: {projectClosure.Id}");
                Console.WriteLine($"  ProjectId: {projectClosure.ProjectId}");
                Console.WriteLine($"  BudgetEstimate: {projectClosure.BudgetEstimate}");
                Console.WriteLine($"  PlanningIssues: {projectClosure.PlanningIssues}");
                Console.WriteLine($"  PlanningLessons: {projectClosure.PlanningLessons}");
                Console.WriteLine($"  Positives: {projectClosure.Positives}");
                Console.WriteLine($"  LessonsLearned: {projectClosure.LessonsLearned}");
                Console.WriteLine($"  AsBuiltManuals: {projectClosure.AsBuiltManuals}");
                Console.WriteLine($"  AsBuiltManualsValue: {projectClosure.AsBuiltManualsValue}");
                Console.WriteLine($"  BriefAims: {projectClosure.BriefAims}");
                Console.WriteLine($"  ClientPayment: {projectClosure.ClientPayment}");
                Console.WriteLine($"  ConstructabilityReview: {projectClosure.ConstructabilityReview}");
                Console.WriteLine($"  ConstructionInvolvement: {projectClosure.ConstructionInvolvement}");
                Console.WriteLine($"  ConstructionInvolvementValue: {projectClosure.ConstructionInvolvementValue}");
                Console.WriteLine($"  ConstructionOther: {projectClosure.ConstructionOther}");
                Console.WriteLine($"  DesignReviewOutputs: {projectClosure.DesignReviewOutputs}");
                Console.WriteLine($"  Efficiencies: {projectClosure.Efficiencies}");
                Console.WriteLine($"  EfficienciesValue: {projectClosure.EfficienciesValue}");
                Console.WriteLine($"  HealthSafetyConcerns: {projectClosure.HealthSafetyConcerns}");
                Console.WriteLine($"  HealthSafetyConcernsValue: {projectClosure.HealthSafetyConcernsValue}");
                Console.WriteLine($"  Hindrances: {projectClosure.Hindrances}");
                Console.WriteLine($"  HsFileForwarded: {projectClosure.HsFileForwarded}");
                Console.WriteLine($"  HsFileForwardedValue: {projectClosure.HsFileForwardedValue}");
                Console.WriteLine($"  MaintenanceAgreements: {projectClosure.MaintenanceAgreements}");
                Console.WriteLine($"  MaintenanceAgreementsValue: {projectClosure.MaintenanceAgreementsValue}");
                Console.WriteLine($"  OperationalRequirements: {projectClosure.OperationalRequirements}");
                Console.WriteLine($"  OperationalRequirementsValue: {projectClosure.OperationalRequirementsValue}");
                Console.WriteLine($"  PlanUseful: {projectClosure.PlanUseful}");
                Console.WriteLine($"  ProgrammeRealistic: {projectClosure.ProgrammeRealistic}");
                Console.WriteLine($"  ProgrammeRealisticValue: {projectClosure.ProgrammeRealisticValue}");
                Console.WriteLine($"  ProgrammeUpdates: {projectClosure.ProgrammeUpdates}");
                Console.WriteLine($"  ProgrammeUpdatesValue: {projectClosure.ProgrammeUpdatesValue}");
                Console.WriteLine($"  RequiredQuality: {projectClosure.RequiredQuality}");
                Console.WriteLine($"  RequiredQualityValue: {projectClosure.RequiredQualityValue}");
                Console.WriteLine($"  TechnoLegalIssues: {projectClosure.TechnoLegalIssues}");
                Console.WriteLine($"  Variations: {projectClosure.Variations}");

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

                _repository.UpdateAsync(projectClosure).GetAwaiter().GetResult();
                _repository.SaveChangesAsync().GetAwaiter().GetResult();

                Console.WriteLine($"Successfully updated project closure with ID {projectClosure.Id}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating project closure: {ex.ToString()}");
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

                // Check if the entity exists
                var projectClosure = _repository.GetByIdAsync(id).GetAwaiter().GetResult();
                if (projectClosure != null)
                {
                    try
                    {
                        // Perform hard delete - completely remove from the database
                        _repository.RemoveAsync(projectClosure).GetAwaiter().GetResult();
                        _repository.SaveChangesAsync().GetAwaiter().GetResult();
                        Console.WriteLine($"Successfully deleted project closure with ID {id}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error during database delete operation: {ex.Message}");
                        if (ex.InnerException != null)
                        {
                            Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                        }
                        throw; // Re-throw to be handled by the caller
                    }
                }
                else
                {
                    // If not found, log it but don't throw an exception
                    // This allows the DELETE API to return success even if the entity doesn't exist
                    Console.WriteLine($"Project closure with ID {id} not found, but continuing as if deleted");
                }
            }
            catch (ArgumentException ex)
            {
                // Re-throw argument exceptions for invalid IDs
                Console.WriteLine($"Invalid argument in Delete: {ex.Message}");
                throw;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting project closure with ID {id}: {ex.Message}");
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
                    Console.WriteLine("Reset ProjectClosures identity seed to 0");
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
                    Console.WriteLine($"Reset ProjectClosures identity seed to {nextId - 1}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error resetting identity seed: {ex.Message}");
                // Don't throw the exception, just log it
            }
        }
    }
}
