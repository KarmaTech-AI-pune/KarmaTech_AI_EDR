using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace NJSAPI.Data
{
    public static class DatabaseUtility
    {
        private static string DbFilePath = "dummydatabase.json";
        private static JObject database;

        static DatabaseUtility()
        {
            LoadDatabase();
        }

        private static void LoadDatabase()
        {
            if (File.Exists(DbFilePath))
            {
                string json = File.ReadAllText(DbFilePath);
                database = JObject.Parse(json);
            }
            else
            {
                throw new FileNotFoundException("Database file not found.");
            }
        }

        private static void SaveDatabase()
        {
            string json = JsonConvert.SerializeObject(database, Formatting.Indented);
            File.WriteAllText(DbFilePath, json);
        }

        public static List<T> GetAll<T>() where T : class
        {
            string tableName = typeof(T).Name + "s";
            return database[tableName]?.ToObject<List<T>>() ?? new List<T>();
        }

        public static T GetById<T>(int id) where T : class
        {
            var all = GetAll<T>();
            return all.FirstOrDefault(e => (int)e.GetType().GetProperty("Id").GetValue(e) == id);
        }

        public static T Add<T>(T entity) where T : class
        {
            string tableName = typeof(T).Name + "s";
            var all = GetAll<T>();
            var idProperty = typeof(T).GetProperty("Id");
            int newId = all.Count > 0 ? all.Max(e => (int)idProperty.GetValue(e)) + 1 : 1;
            idProperty.SetValue(entity, newId);
            all.Add(entity);
            database[tableName] = JArray.FromObject(all);
            SaveDatabase();
            return entity;
        }

        public static T Update<T>(int id, T updatedEntity) where T : class
        {
            string tableName = typeof(T).Name + "s";
            var all = GetAll<T>();
            var index = all.FindIndex(e => (int)e.GetType().GetProperty("Id").GetValue(e) == id);
            if (index != -1)
            {
                all[index] = updatedEntity;
                database[tableName] = JArray.FromObject(all);
                SaveDatabase();
                return updatedEntity;
            }
            return null;
        }

        public static bool Delete<T>(int id) where T : class
        {
            string tableName = typeof(T).Name + "s";
            var all = GetAll<T>();
            var entity = all.FirstOrDefault(e => (int)e.GetType().GetProperty("Id").GetValue(e) == id);
            if (entity != null)
            {
                all.Remove(entity);
                database[tableName] = JArray.FromObject(all);
                SaveDatabase();
                return true;
            }
            return false;
        }

        public static List<ProjectWithDetails> GetProjectsWithDetails()
        {
            var projects = GetAll<Project>();
            var clients = GetAll<Client>();
            var users = GetAll<User>();
            var statuses = GetAll<ProjectStatus>();
            var tasks = GetAll<WbsTask>();
            var feasibilityStudies = GetAll<FeasibilityStudy>();
            var goNoGoDecisions = GetAll<GoNoGoDecision>();

            return projects.Select(p => new ProjectWithDetails
            {
                Project = p,
                Client = clients.FirstOrDefault(c => c.Id == p.ClientId),
                ProjectManager = users.FirstOrDefault(u => u.Id == p.ProjectManagerId),
                Status = statuses.FirstOrDefault(s => s.Id == p.StatusId),
                Tasks = tasks.Where(t => t.ProjectId == p.Id).ToList(),
                FeasibilityStudy = feasibilityStudies.FirstOrDefault(f => f.ProjectId == p.Id),
                GoNoGoDecision = goNoGoDecisions.FirstOrDefault(g => g.ProjectId == p.Id)
            }).ToList();
        }

        public static List<ResourceWithSkills> GetResourcesWithSkills()
        {
            var resources = GetAll<Resource>();
            var skillMatrix = GetAll<SkillMatrix>();
            var skills = GetAll<Skill>();
            var skillLevels = GetAll<SkillLevel>();

            return resources.Select(r => new ResourceWithSkills
            {
                Resource = r,
                Skills = skillMatrix
                    .Where(sm => sm.ResourceId == r.Id)
                    .Select(sm => new SkillWithProficiency
                    {
                        Skill = skills.FirstOrDefault(s => s.Id == sm.SkillId),
                        ProficiencyLevel = sm.ProficiencyLevel,
                        SkillLevel = skillLevels.FirstOrDefault(sl => sl.Id == r.SkillLevelId)
                    }).ToList()
            }).ToList();
        }

        public static List<TaskWithDetails> GetTasksWithDetails()
        {
            var tasks = GetAll<WbsTask>();
            var taskTypes = GetAll<TaskType>();
            var taskStatuses = GetAll<TaskStatus>();
            var resourceAllocations = GetAll<ResourceAllocation>();
            var resources = GetAll<Resource>();

            return tasks.Select(t => new TaskWithDetails
            {
                Task = t,
                TaskType = taskTypes.FirstOrDefault(tt => tt.Id == t.TaskTypeId),
                Status = taskStatuses.FirstOrDefault(ts => ts.Id == t.StatusId),
                ResourceAllocations = resourceAllocations
                    .Where(ra => ra.TaskId == t.Id)
                    .Select(ra => new ResourceAllocationWithDetails
                    {
                        ResourceAllocation = ra,
                        Resource = resources.FirstOrDefault(r => r.Id == ra.ResourceId)
                    }).ToList()
            }).ToList();
        }

        public static User AuthenticateUser(string username, string password)
        {
            var users = GetAll<User>();
            return users.FirstOrDefault(u => u.Username == username && u.PasswordHash == password);
        }

        // Add more specific methods as needed for complex operations or relationships
    }

    // Define entity classes
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public int RoleId { get; set; }
        public bool IsActive { get; set; }
        public DateTime LastLogin { get; set; }
    }

    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int StatusId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Budget { get; set; }
        public int ClientId { get; set; }
        public int ProjectManagerId { get; set; }
    }

    public class FeasibilityStudy
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int StrategicRanking { get; set; }
        public decimal EstimatedCost { get; set; }
        public decimal EstimatedRevenue { get; set; }
        public float SuccessProbability { get; set; }
        public string FundingStream { get; set; }
        public int ContractTypeId { get; set; }
        public string CompetitionAnalysis { get; set; }
        public string QualifyingCriteria { get; set; }
        public DateTime SubmissionDate { get; set; }
    }

    public class GoNoGoDecision
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int DecisionStatusId { get; set; }
        public float TotalScore { get; set; }
        public string Comments { get; set; }
        public int ApproverId { get; set; }
        public DateTime DecisionDate { get; set; }
    }

    public class WbsTask
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int? ParentTaskId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int TaskTypeId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal PlannedCost { get; set; }
        public decimal ActualCost { get; set; }
        public int StatusId { get; set; }
    }

    public class Resource
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int ResourceTypeId { get; set; }
        public decimal CostRate { get; set; }
        public int SkillLevelId { get; set; }
    }

    public class SkillMatrix
    {
        public int Id { get; set; }
        public int ResourceId { get; set; }
        public int SkillId { get; set; }
        public int ProficiencyLevel { get; set; }
    }

    public class Client
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ContactPerson { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
    }

    // Add other entity classes as needed...
     public class ProjectStatus
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
        }

        public class Skill
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
        }

        public class TaskType
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
        }

        public class SkillLevel
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
        }

        public class ResourceAllocation
        {
            public int Id { get; set; }
            public int ResourceId { get; set; }
            public int TaskId { get; set; }
            public float AllocatedHours { get; set; }
            public DateTime StartDate { get; set; }
            public DateTime EndDate { get; set; }
        }

        public class TaskStatus
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
        }

    // Define complex return types for detailed queries
    public class ProjectWithDetails
    {
        public Project Project { get; set; }
        public Client Client { get; set; }
        public User ProjectManager { get; set; }
        public ProjectStatus Status { get; set; }
        public List<WbsTask> Tasks { get; set; }
        public FeasibilityStudy FeasibilityStudy { get; set; }
        public GoNoGoDecision GoNoGoDecision { get; set; }
    }

    public class ResourceWithSkills
    {
        public Resource Resource { get; set; }
        public List<SkillWithProficiency> Skills { get; set; }
    }

    public class SkillWithProficiency
    {
        public Skill Skill { get; set; }
        public int ProficiencyLevel { get; set; }
        public SkillLevel SkillLevel { get; set; }
    }

    public class TaskWithDetails
    {
        public WbsTask Task { get; set; }
        public TaskType TaskType { get; set; }
        public TaskStatus Status { get; set; }
        public List<ResourceAllocationWithDetails> ResourceAllocations { get; set; }
    }

    public class ResourceAllocationWithDetails
    {
        public ResourceAllocation ResourceAllocation { get; set; }
        public Resource Resource { get; set; }
    }
}