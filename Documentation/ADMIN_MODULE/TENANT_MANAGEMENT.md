# Tenant Management Feature

## Overview

The Tenant Management feature provides comprehensive multi-tenancy support for the EDR application. It enables system administrators to create and manage organizations (tenants), each with isolated data, users, and configurations.

## Business Value

- Multi-organization support (SaaS model)
- Data isolation between tenants
- Subscription and billing management
- Resource limits per tenant
- Isolated or shared database options

## Multi-Tenancy Architecture

```mermaid
graph TB
    subgraph "Shared Infrastructure"
        API[API Layer]
        AUTH[Authentication]
        SHARED_DB[(Shared Database)]
    end
    
    subgraph "Tenant A"
        TA_USERS[Users A]
        TA_DATA[Data A]
        TA_DB[(Isolated DB A)]
    end
    
    subgraph "Tenant B"
        TB_USERS[Users B]
        TB_DATA[Data B]
    end
    
    subgraph "Tenant C"
        TC_USERS[Users C]
        TC_DATA[Data C]
        TC_DB[(Isolated DB C)]
    end
    
    API --> AUTH
    AUTH --> SHARED_DB
    
    TA_USERS --> TA_DATA
    TA_DATA --> TA_DB
    
    TB_USERS --> TB_DATA
    TB_DATA --> SHARED_DB
    
    TC_USERS --> TC_DATA
    TC_DATA --> TC_DB
```

## Database Schema

### Entity Relationships

```mermaid
erDiagram
    Tenant {
        int Id PK
        string Name
        string Domain
        string CompanyName
        string ContactEmail
        string ContactPhone
        enum Status
        datetime CreatedAt
        datetime TrialEndDate
        datetime SubscriptionEndDate
        string StripeCustomerId
        string StripeSubscriptionId
        int SubscriptionPlanId FK
        int MaxUsers
        int MaxProjects
        bool IsActive
        bool IsIsolated
    }
    
    TenantDatabase {
        int Id PK
        int TenantId FK
        string DatabaseName
        string ConnectionString
        enum Status
        datetime CreatedAt
        datetime LastBackup
    }
    
    TenantUser {
        int Id PK
        int TenantId FK
        string UserId FK
        enum Role
        datetime JoinedAt
        bool IsActive
    }
    
    SubscriptionPlan {
        int Id PK
        string Name
        decimal MonthlyPrice
        int MaxUsers
        int MaxProjects
    }
    
    Tenant ||--o{ TenantUser : "has"
    Tenant ||--o{ TenantDatabase : "has"
    Tenant ||--o| SubscriptionPlan : "subscribes"
```

### Table Definitions

```sql
-- Tenants
CREATE TABLE Tenants (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(255) NOT NULL,
    Domain NVARCHAR(255) NOT NULL,
    CompanyName NVARCHAR(255),
    ContactEmail NVARCHAR(255),
    ContactPhone NVARCHAR(255),
    Status INT NOT NULL DEFAULT 0, -- TenantStatus enum
    CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    TrialEndDate DATETIME,
    SubscriptionEndDate DATETIME,
    StripeCustomerId NVARCHAR(255),
    StripeSubscriptionId NVARCHAR(255),
    SubscriptionPlanId INT,
    MaxUsers INT NOT NULL DEFAULT 10,
    MaxProjects INT NOT NULL DEFAULT 50,
    IsActive BIT NOT NULL DEFAULT 1,
    IsIsolated BIT NOT NULL DEFAULT 0,
    
    CONSTRAINT FK_Tenants_SubscriptionPlan 
        FOREIGN KEY (SubscriptionPlanId) REFERENCES SubscriptionPlans(Id)
);

-- TenantDatabases
CREATE TABLE TenantDatabases (
    Id INT PRIMARY KEY IDENTITY(1,1),
    TenantId INT NOT NULL,
    DatabaseName NVARCHAR(255) NOT NULL,
    ConnectionString NVARCHAR(500),
    Status INT NOT NULL DEFAULT 0, -- DatabaseStatus enum
    CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    LastBackup DATETIME,
    
    CONSTRAINT FK_TenantDatabases_Tenant 
        FOREIGN KEY (TenantId) REFERENCES Tenants(Id)
);
```

### Entity Classes

```csharp
// Tenant.cs
public class Tenant
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Domain { get; set; }
    public string CompanyName { get; set; }
    public string ContactEmail { get; set; }
    public string ContactPhone { get; set; }
    public TenantStatus Status { get; set; } = TenantStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? TrialEndDate { get; set; }
    public DateTime? SubscriptionEndDate { get; set; }
    public string StripeCustomerId { get; set; }
    public string StripeSubscriptionId { get; set; }
    public int? SubscriptionPlanId { get; set; }
    public int MaxUsers { get; set; } = 10;
    public int MaxProjects { get; set; } = 50;
    public bool IsActive { get; set; } = true;
    public bool IsIsolated { get; set; } = false;

    public virtual SubscriptionPlan SubscriptionPlan { get; set; }
    public virtual ICollection<TenantUser> TenantUsers { get; set; }
    public virtual ICollection<TenantDatabase> TenantDatabases { get; set; }
}

public enum TenantStatus
{
    Active,
    Suspended,
    Cancelled,
    Trial,
    Expired
}

// TenantDatabase.cs
[Table("TenantDatabases")]
public class TenantDatabase
{
    public int Id { get; set; }
    public int TenantId { get; set; }
    public string DatabaseName { get; set; }
    public string ConnectionString { get; set; }
    public DatabaseStatus Status { get; set; } = DatabaseStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastBackup { get; set; }

    public virtual Tenant Tenant { get; set; }
}

public enum DatabaseStatus
{
    Active,
    Provisioning,
    Suspended,
    Deleted
}
```

## API Endpoints

### Tenants CQRS Operations

| Operation | Type | Description |
|-----------|------|-------------|
| CreateTenantCommand | Command | Create new tenant |
| UpdateTenantCommand | Command | Update tenant details |
| DeleteTenantCommand | Command | Delete tenant |
| GetAllTenantsQuery | Query | Get all tenants |
| GetTenantByIdQuery | Query | Get tenant by ID |

### API Endpoints

```http
# Get all tenants
GET /api/tenants
Authorization: Bearer {token}

Response: 200 OK
[
    {
        "id": 1,
        "name": "Acme Corp",
        "domain": "acme",
        "companyName": "Acme Corporation",
        "contactEmail": "admin@acme.com",
        "contactPhone": "+1-555-0100",
        "status": "Active",
        "createdAt": "2024-01-15T10:00:00Z",
        "subscriptionPlan": {
            "id": 2,
            "name": "Professional",
            "monthlyPrice": 99.00
        },
        "maxUsers": 25,
        "maxProjects": 100,
        "isActive": true,
        "isIsolated": false,
        "tenantUsers": [...]
    }
]

# Get tenant by ID
GET /api/tenants/{id}
Authorization: Bearer {token}

Response: 200 OK
{
    "id": 1,
    "name": "Acme Corp",
    ...
}

# Create tenant
POST /api/tenants
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
    "name": "New Company",
    "domain": "newcompany",
    "companyName": "New Company Inc.",
    "contactEmail": "admin@newcompany.com",
    "contactPhone": "+1-555-0200",
    "subscriptionPlanId": 1,
    "maxUsers": 10,
    "maxProjects": 50,
    "status": "Trial",
    "isIsolated": false
}

Response: 201 Created
{
    "id": 5,
    "name": "New Company",
    ...
}

# Update tenant
PUT /api/tenants/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
    "name": "Updated Company Name",
    "maxUsers": 50,
    "maxProjects": 200,
    "status": "Active",
    "subscriptionPlanId": 2
}

Response: 200 OK

# Delete tenant
DELETE /api/tenants/{id}
Authorization: Bearer {token}

Response: 204 No Content
```

## Frontend Components

### TenantManagement Component

**Location**: `frontend/src/components/adminpanel/TenantManagement.tsx`

**Features**:
- Tenant list with status indicators
- Dashboard cards (total, active, trial, suspended)
- Create/Edit tenant dialog
- Subscription plan assignment
- User/Project limit configuration
- Isolated database toggle

**Component Structure**:
```typescript
interface TenantManagementState {
    tenants: Tenant[];
    subscriptionPlans: SubscriptionPlan[];
    open: boolean;
    editingTenant: Tenant | null;
    formData: TenantFormData;
    error: string | null;
}

interface TenantFormData {
    id: number;
    name: string;
    domain: string;
    companyName: string;
    contactEmail: string;
    contactPhone: string;
    subscriptionPlanId: string;
    maxUsers: number;
    maxProjects: number;
    status: TenantStatus;
    isIsolated: boolean;
}
```

**Key Functions**:
- `loadTenants()`: Fetch all tenants
- `loadSubscriptionPlans()`: Fetch available plans
- `handleSubmit()`: Create or update tenant
- `handleDelete()`: Delete tenant with confirmation
- `getStatusColor()`: Get status chip color
- `getStatusIcon()`: Get status indicator icon

### TenantUsersManagement Component

**Location**: `frontend/src/components/adminpanel/TenantUsersManagement.tsx`

**Features**:
- Manage users within a tenant
- Assign tenant-specific roles
- Activate/deactivate tenant users

## Business Logic

### Tenant Creation Flow

```mermaid
sequenceDiagram
    participant UI as TenantManagement
    participant API as TenantsController
    participant Handler as CreateTenantHandler
    participant DB as Database
    participant DBService as DatabaseService
    
    UI->>API: POST /api/tenants
    API->>Handler: CreateTenantCommand
    Handler->>DB: Insert Tenant
    
    alt isIsolated = true
        Handler->>DBService: ProvisionDatabase()
        DBService->>DB: Create TenantDatabase
        DBService->>DBService: Run Migrations
    end
    
    Handler-->>API: TenantDto
    API-->>UI: 201 Created
```

### Tenant Resolution Flow

```mermaid
sequenceDiagram
    participant Client as Browser
    participant API as API
    participant Resolver as TenantResolver
    participant Context as TenantContext
    participant DB as Database
    
    Client->>API: Request with domain header
    API->>Resolver: ResolveTenant(domain)
    Resolver->>DB: GetTenantByDomain(domain)
    DB-->>Resolver: Tenant
    Resolver->>Context: SetCurrentTenant(tenant)
    Context-->>API: TenantId available
    API->>DB: Query with TenantId filter
```

### Multi-Tenant Data Isolation

```csharp
// ITenantEntity interface
public interface ITenantEntity
{
    int TenantId { get; set; }
}

// Global query filter in DbContext
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // Apply tenant filter to all tenant entities
    modelBuilder.Entity<Project>()
        .HasQueryFilter(p => p.TenantId == _currentTenantService.TenantId);
}

// Tenant resolution service
public class CurrentTenantService : ICurrentTenantService
{
    public int TenantId { get; private set; }
    
    public void SetTenant(int tenantId)
    {
        TenantId = tenantId;
    }
}
```

## Tenant Status Workflow

```mermaid
stateDiagram-v2
    [*] --> Trial: Create Tenant
    Trial --> Active: Subscribe
    Trial --> Expired: Trial Ends
    Active --> Suspended: Payment Failed
    Active --> Cancelled: Cancel Subscription
    Suspended --> Active: Payment Resolved
    Suspended --> Cancelled: Cancel
    Expired --> Active: Subscribe
    Cancelled --> [*]
```

## Validation Rules

| Field | Rule |
|-------|------|
| Name | Required, 2-255 characters |
| Domain | Required, unique, alphanumeric + hyphen |
| ContactEmail | Valid email format |
| MaxUsers | >= 1 |
| MaxProjects | >= 1 |

## Subscription Integration

### Stripe Integration

- `StripeCustomerId`: Links to Stripe customer
- `StripeSubscriptionId`: Links to Stripe subscription
- Webhook handlers for subscription events

### Subscription Plans

| Plan | Price | Max Users | Max Projects |
|------|-------|-----------|--------------|
| Free | $0 | 3 | 5 |
| Starter | $29 | 10 | 25 |
| Professional | $99 | 50 | 100 |
| Enterprise | Custom | Unlimited | Unlimited |

## Database Isolation Options

### Shared Database (Default)
- All tenants share one database
- Data isolated by TenantId column
- Cost-effective for small tenants

### Isolated Database
- Dedicated database per tenant
- Complete data isolation
- Better for enterprise/compliance needs
- Higher infrastructure cost

## Testing Coverage

### Existing Tests

- `backend/src/NJS.Application/CQRS/Tenants/` - Tenant CQRS tests
- Tenant creation tests
- Multi-tenant isolation tests

### Test Scenarios

| Scenario | Type | Status |
|----------|------|--------|
| Create tenant | Unit | ✓ |
| Update tenant status | Integration | ✓ |
| Tenant data isolation | Integration | ✓ |
| Subscription assignment | Integration | ✓ |

## Related Features

- [User Management](./USER_MANAGEMENT.md)
- [Role & Permission](./ROLE_PERMISSION.md)
- [System Settings](./SYSTEM_SETTINGS.md)
