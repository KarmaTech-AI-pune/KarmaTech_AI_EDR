---
inclusion: fileMatch
fileMatchPattern: '**/*.sql|**/Entities/**|**/Models/**|**/Migrations/**|**/DbContext/**'
---

# EDR Database Schema Patterns for AI-DLC Implementation

## Database Overview

**Primary Database**: Microsoft SQL Server (KarmaTechAI_SAAS)
**Secondary Database**: MongoDB Atlas (Cloud)
**Migration Strategy**: EF Core Code-First Migrations

## Core Entity Patterns

### 1. Base Entity Pattern
```csharp
// Base audit entity for all tables
public abstract class BaseEntity
{
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string CreatedBy { get; set; }
    public string UpdatedBy { get; set; }
}

// Example implementation
public class Project : BaseEntity
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; }
    public decimal EstimatedProjectCost { get; set; }
    public int? RegionId { get; set; }
    
    // Navigation properties
    public virtual Region Region { get; set; }
    public virtual ICollection<MonthlyProgress> MonthlyProgresses { get; set; }
}
```

### 2. Naming Conventions

#### Tables
```sql
-- ✅ GOOD - PascalCase, singular names
CREATE TABLE Project
CREATE TABLE MonthlyProgress
CREATE TABLE OpportunityTracking
CREATE TABLE WorkBreakdownStructure

-- ❌ BAD
CREATE TABLE projects           -- Should be singular
CREATE TABLE monthly_progress   -- Should be PascalCase
```

#### Columns
```sql
-- ✅ GOOD - PascalCase
ProjectId INT PRIMARY KEY IDENTITY(1,1)
ProjectName NVARCHAR(255) NOT NULL
EstimatedProjectCost DECIMAL(18,2)
CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE()

-- ❌ BAD
project_id INT              -- Should be PascalCase
PROJECTNAME NVARCHAR(255)   -- Should be PascalCase
estimated_cost DECIMAL(18,2) -- Should be PascalCase
```

#### Primary Keys
```sql
-- ✅ GOOD - {TableName}Id pattern
ProjectId       -- for Project table
UserId          -- for AspNetUsers table
OpportunityId   -- for OpportunityTracking table
```

#### Foreign Keys
```sql
-- ✅ GOOD - {ReferencedTable}Id pattern
ProjectId INT REFERENCES Project(ProjectId)
RegionId INT REFERENCES Region(RegionId)
StatusId INT REFERENCES OpportunityStatus(StatusId)
```

## Core Tables Structure

### 1. User Management (ASP.NET Identity Extended)
```sql
-- AspNetUsers (Extended)
CREATE TABLE AspNetUsers (
    Id NVARCHAR(450) PRIMARY KEY,
    UserName NVARCHAR(256),
    Email NVARCHAR(256),
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    Avatar NVARCHAR(500),
    LastLogin DATETIME,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME
);
```

### 2. Core Business Entities
```sql
-- Region
CREATE TABLE Region (
    RegionId INT PRIMARY KEY IDENTITY(1,1),
    RegionName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE()
);

-- Project
CREATE TABLE Project (
    ProjectId INT PRIMARY KEY IDENTITY(1,1),
    ProjectName NVARCHAR(255) NOT NULL,
    ProjectNumber NVARCHAR(50),
    Description NVARCHAR(MAX),
    StartDate DATETIME,
    EndDate DATETIME,
    Status NVARCHAR(50),
    EstimatedProjectCost DECIMAL(18,2) NOT NULL DEFAULT 0,
    EstimatedProjectFee DECIMAL(18,2) NOT NULL DEFAULT 0,
    ProjectManager NVARCHAR(100),
    RegionId INT,
    CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME,
    CreatedBy NVARCHAR(450),
    UpdatedBy NVARCHAR(450),
    
    CONSTRAINT FK_Project_Region FOREIGN KEY (RegionId) REFERENCES Region(RegionId),
    CONSTRAINT FK_Project_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES AspNetUsers(Id),
    CONSTRAINT FK_Project_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES AspNetUsers(Id)
);
```

### 3. Business Development Module
```sql
-- OpportunityStatus
CREATE TABLE OpportunityStatus (
    StatusId INT PRIMARY KEY IDENTITY(1,1),
    StatusName NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255),
    DisplayOrder INT NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1
);

-- OpportunityTracking
CREATE TABLE OpportunityTracking (
    OpportunityId INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    Client NVARCHAR(200),
    BidFees DECIMAL(18,2),
    Emd DECIMAL(18,2),
    PercentageChanceOfProjectHappening DECIMAL(5,2),
    PercentageChanceOfNJSSuccess DECIMAL(5,2),
    GrossRevenue DECIMAL(18,2),
    NetNJSRevenue DECIMAL(18,2),
    BidSubmissionDate DATETIME,
    StatusId INT,
    ApprovalManagerId NVARCHAR(450),
    ReviewManagerId NVARCHAR(450),
    CreatedBy NVARCHAR(450),
    UpdatedBy NVARCHAR(450),
    CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME,
    
    CONSTRAINT FK_OpportunityTracking_Status FOREIGN KEY (StatusId) REFERENCES OpportunityStatus(StatusId),
    CONSTRAINT FK_OpportunityTracking_ApprovalManager FOREIGN KEY (ApprovalManagerId) REFERENCES AspNetUsers(Id),
    CONSTRAINT FK_OpportunityTracking_ReviewManager FOREIGN KEY (ReviewManagerId) REFERENCES AspNetUsers(Id),
    CONSTRAINT FK_OpportunityTracking_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES AspNetUsers(Id),
    CONSTRAINT FK_OpportunityTracking_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES AspNetUsers(Id)
);
```

### 4. Work Breakdown Structure
```sql
-- WorkBreakdownStructure
CREATE TABLE WorkBreakdownStructure (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProjectId INT NOT NULL,
    CreatedBy NVARCHAR(450),
    CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME,
    
    CONSTRAINT FK_WBS_Project FOREIGN KEY (ProjectId) REFERENCES Project(ProjectId),
    CONSTRAINT FK_WBS_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES AspNetUsers(Id)
);

-- WBSTask (Hierarchical structure)
CREATE TABLE WBSTask (
    TaskId INT PRIMARY KEY IDENTITY(1,1),
    WorkBreakdownStructureId INT NOT NULL,
    ParentId INT,  -- Self-referencing for hierarchy
    TaskName NVARCHAR(255) NOT NULL,
    TaskLevel INT NOT NULL,
    EstimatedBudget DECIMAL(18,2),
    EstimatedHours DECIMAL(18,2),
    StartDate DATETIME,
    EndDate DATETIME,
    Status NVARCHAR(50),
    CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_WBSTask_WBS FOREIGN KEY (WorkBreakdownStructureId) REFERENCES WorkBreakdownStructure(Id),
    CONSTRAINT FK_WBSTask_Parent FOREIGN KEY (ParentId) REFERENCES WBSTask(TaskId)
);
```

## Data Type Standards

### 1. Common Data Types
```sql
-- Text fields
ShortText NVARCHAR(50)          -- Status, codes
MediumText NVARCHAR(255)        -- Names, titles
LongText NVARCHAR(MAX)          -- Descriptions, comments

-- Numeric fields
Currency DECIMAL(18,2)          -- Money values
Percentage DECIMAL(5,2)         -- Percentages (0.00 to 100.00)
Hours DECIMAL(18,2)             -- Time tracking
Quantity INT                    -- Counts, quantities

-- Date/Time fields
Timestamp DATETIME NOT NULL DEFAULT GETUTCDATE()
OptionalDate DATETIME           -- Nullable dates
AuditDate DATETIME NOT NULL     -- Required audit fields

-- Boolean fields
Flag BIT NOT NULL DEFAULT 0     -- True/false values
Status BIT NOT NULL DEFAULT 1   -- Active/inactive
```

### 2. Constraint Patterns
```sql
-- Check constraints
CONSTRAINT CK_Project_EstimatedCost CHECK (EstimatedProjectCost >= 0)
CONSTRAINT CK_Opportunity_Percentage CHECK (PercentageChanceOfProjectHappening BETWEEN 0 AND 100)

-- Default constraints
CONSTRAINT DF_Project_CreatedAt DEFAULT (GETUTCDATE()) FOR CreatedAt
CONSTRAINT DF_Project_IsActive DEFAULT (1) FOR IsActive

-- Unique constraints
CONSTRAINT UQ_Project_ProjectNumber UNIQUE (ProjectNumber)
CONSTRAINT UQ_Region_RegionName UNIQUE (RegionName)
```

## Index Patterns

### 1. Primary Key Indexes (Automatic)
```sql
-- Clustered indexes on primary keys (automatic)
CREATE CLUSTERED INDEX PK_Project ON Project(ProjectId)
CREATE CLUSTERED INDEX PK_OpportunityTracking ON OpportunityTracking(OpportunityId)
```

### 2. Foreign Key Indexes
```sql
-- Non-clustered indexes on foreign keys
CREATE INDEX IX_Project_RegionId ON Project(RegionId)
CREATE INDEX IX_OpportunityTracking_StatusId ON OpportunityTracking(StatusId)
CREATE INDEX IX_WBSTask_WorkBreakdownStructureId ON WBSTask(WorkBreakdownStructureId)
CREATE INDEX IX_WBSTask_ParentId ON WBSTask(ParentId)
```

### 3. Query Optimization Indexes
```sql
-- Indexes for common queries
CREATE INDEX IX_Project_Status ON Project(Status)
CREATE INDEX IX_Project_CreatedAt ON Project(CreatedAt DESC)
CREATE INDEX IX_OpportunityTracking_BidSubmissionDate ON OpportunityTracking(BidSubmissionDate)

-- Composite indexes for complex queries
CREATE INDEX IX_Project_Status_Region ON Project(Status, RegionId)
CREATE INDEX IX_OpportunityTracking_Status_CreatedBy ON OpportunityTracking(StatusId, CreatedBy)
```

## Audit and History Patterns

### 1. Audit Log Table
```sql
CREATE TABLE AuditLog (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    EntityName NVARCHAR(100) NOT NULL,
    Action NVARCHAR(50) NOT NULL,  -- INSERT, UPDATE, DELETE
    EntityId NVARCHAR(50) NOT NULL,
    OldValues NVARCHAR(MAX),       -- JSON
    NewValues NVARCHAR(MAX),       -- JSON
    ChangedBy NVARCHAR(450) NOT NULL,
    ChangedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    IpAddress NVARCHAR(45),
    UserAgent NVARCHAR(500),
    
    CONSTRAINT FK_AuditLog_ChangedBy FOREIGN KEY (ChangedBy) REFERENCES AspNetUsers(Id)
);

-- Indexes for audit queries
CREATE INDEX IX_AuditLog_EntityName_EntityId ON AuditLog(EntityName, EntityId)
CREATE INDEX IX_AuditLog_ChangedAt ON AuditLog(ChangedAt DESC)
CREATE INDEX IX_AuditLog_ChangedBy ON AuditLog(ChangedBy)
```

### 2. History Tables Pattern
```sql
-- OpportunityHistory
CREATE TABLE OpportunityHistory (
    HistoryId INT PRIMARY KEY IDENTITY(1,1),
    OpportunityId INT NOT NULL,
    StatusId INT NOT NULL,
    ActionBy NVARCHAR(450) NOT NULL,
    ActionDate DATETIME NOT NULL DEFAULT GETUTCDATE(),
    Comments NVARCHAR(MAX),
    
    CONSTRAINT FK_OpportunityHistory_Opportunity FOREIGN KEY (OpportunityId) REFERENCES OpportunityTracking(OpportunityId),
    CONSTRAINT FK_OpportunityHistory_Status FOREIGN KEY (StatusId) REFERENCES OpportunityStatus(StatusId),
    CONSTRAINT FK_OpportunityHistory_ActionBy FOREIGN KEY (ActionBy) REFERENCES AspNetUsers(Id)
);
```

## Workflow Status Pattern

### 1. Workflow Status Table
```sql
CREATE TABLE PMWorkflowStatus (
    Id INT PRIMARY KEY IDENTITY(1,1),
    StatusName NVARCHAR(100) NOT NULL,
    StatusType NVARCHAR(50) NOT NULL,  -- OpportunityTracking, ProjectClosure, etc.
    Description NVARCHAR(255),
    DisplayOrder INT NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    
    CONSTRAINT UQ_PMWorkflowStatus_Name_Type UNIQUE (StatusName, StatusType)
);

-- Sample data
INSERT INTO PMWorkflowStatus (StatusName, StatusType, Description, DisplayOrder, IsActive)
VALUES
    ('Draft', 'OpportunityTracking', 'Initial draft state', 1, 1),
    ('Submitted for Review', 'OpportunityTracking', 'Awaiting review', 2, 1),
    ('Under Review', 'OpportunityTracking', 'Being reviewed', 3, 1),
    ('Approved', 'OpportunityTracking', 'Approved opportunity', 4, 1);
```

## Entity Framework Configuration Patterns

### 1. Entity Configuration
```csharp
public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        // Table name
        builder.ToTable("Project");
        
        // Primary key
        builder.HasKey(p => p.ProjectId);
        
        // Properties
        builder.Property(p => p.ProjectName)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(p => p.EstimatedProjectCost)
            .HasPrecision(18, 2)
            .HasDefaultValue(0);
            
        builder.Property(p => p.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");
            
        // Relationships
        builder.HasOne(p => p.Region)
            .WithMany()
            .HasForeignKey(p => p.RegionId)
            .OnDelete(DeleteBehavior.SetNull);
            
        // Indexes
        builder.HasIndex(p => p.ProjectNumber)
            .IsUnique()
            .HasDatabaseName("IX_Project_ProjectNumber_Unique");
            
        builder.HasIndex(p => p.Status)
            .HasDatabaseName("IX_Project_Status");
    }
}
```

### 2. DbContext Configuration
```csharp
public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public DbSet<Project> Projects { get; set; }
    public DbSet<Region> Regions { get; set; }
    public DbSet<OpportunityTracking> OpportunityTrackings { get; set; }
    public DbSet<WorkBreakdownStructure> WorkBreakdownStructures { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Apply all configurations
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        
        // Global query filters
        modelBuilder.Entity<Project>()
            .HasQueryFilter(p => p.IsActive);
    }
    
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Update audit fields
        UpdateAuditFields();
        
        return await base.SaveChangesAsync(cancellationToken);
    }
    
    private void UpdateAuditFields()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is BaseEntity && (e.State == EntityState.Added || e.State == EntityState.Modified));
            
        foreach (var entry in entries)
        {
            var entity = (BaseEntity)entry.Entity;
            
            if (entry.State == EntityState.Added)
            {
                entity.CreatedAt = DateTime.UtcNow;
                entity.CreatedBy = GetCurrentUserId();
            }
            
            entity.UpdatedAt = DateTime.UtcNow;
            entity.UpdatedBy = GetCurrentUserId();
        }
    }
}
```

## Migration Patterns

### 1. Migration Naming
```csharp
// Good migration names
20241112_001_CreateProjectTable
20241112_002_AddProjectNumberIndex
20241112_003_AddAuditFieldsToProject

// Migration class example
public partial class CreateProjectTable : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Project",
            columns: table => new
            {
                ProjectId = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                ProjectName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                EstimatedProjectCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Project", x => x.ProjectId);
            });
    }
    
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Project");
    }
}
```

## AI-DLC Database Generation Rules

### 1. Entity Generation Standards
- All entities inherit from BaseEntity
- Follow naming conventions strictly
- Include proper relationships and constraints
- Add appropriate indexes for performance

### 2. Migration Generation
- Generate migrations for all schema changes
- Include rollback scripts
- Test migrations on development database
- Document breaking changes

### 3. Data Seeding
- Include seed data for lookup tables
- Use consistent test data patterns
- Ensure referential integrity

This database schema pattern ensures consistent, scalable, and maintainable database design for AI-DLC generated features.