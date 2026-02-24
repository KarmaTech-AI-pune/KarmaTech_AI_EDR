# Backend ProgramId Filtering - Implementation Complete

## Summary
Made `programId` **REQUIRED** for the GetAllProjects API endpoint. The API now only returns projects for a specific program.

## Changes Made

### 1. Updated Query Model
**File:** `backend/src/EDR.Application/CQRS/Projects/Queries/GetAllProjectsQuery.cs`

**Change:** Made `ProgramId` required (not nullable)
```csharp
public record GetAllProjectsQuery : IRequest<IEnumerable<Project>>
{
    public int ProgramId { get; init; }  // Required, not nullable
}
```

### 2. Updated Query Handler
**File:** `backend/src/EDR.Application/CQRS/Projects/Handlers/GetAllProjectsQueryHandler.cs`

**Change:** Always filters by ProgramId (no conditional check)
```csharp
public async Task<IEnumerable<Project>> Handle(GetAllProjectsQuery request, CancellationToken cancellationToken)
{
    try
    {
        var projects = await _repository.GetAll();
        
        // Filter by ProgramId (required)
        return projects.Where(p => p.ProgramId == request.ProgramId);
    }
    catch (Exception ex)
    {
        throw new ApplicationException("Error retrieving projects", ex);
    }
}
```

### 3. Updated Controller Endpoint
**File:** `backend/src/EDR.API/Controllers/ProjectController.cs`

**Change:** Made programId required with validation
```csharp
[HttpGet]
[ProducesResponseType(typeof(Project[]), 200)]
[ProducesResponseType(400)]
public async Task<IActionResult> GetAll([FromQuery] int programId)
{
    try
    {
        // Validate programId
        if (programId <= 0)
        {
            return BadRequest(new { message = "ProgramId is required and must be greater than 0" });
        }

        // Ensure user has access to current tenant
        if (CurrentTenantId.HasValue)
        {
            var accessCheck = await EnsureTenantAccessAsync(CurrentTenantId.Value);
            if (accessCheck != null) return accessCheck;
        }

        var query = new GetAllProjectsQuery { ProgramId = programId };
        var result = await _mediator.Send(query);
        return Ok(result);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting projects for tenant {TenantId}, programId {ProgramId}", CurrentTenantId, programId);
        return StatusCode(500, new { message = ex.Message });
    }
}
```

## API Usage

### âœ… Valid Request - Get Projects by ProgramId
```
GET /api/project?programId=5
```
Returns only projects belonging to program with ID 5.

### âŒ Invalid Requests

**Missing programId:**
```
GET /api/project
```
Returns: `400 Bad Request` - "ProgramId is required and must be greater than 0"

**Invalid programId (0 or negative):**
```
GET /api/project?programId=0
GET /api/project?programId=-1
```
Returns: `400 Bad Request` - "ProgramId is required and must be greater than 0"

## Benefits

âœ… **Enforced Filtering:** Always filters by program - no accidental "get all projects" calls
âœ… **Clear API Contract:** programId is explicitly required
âœ… **Validation:** Returns 400 Bad Request if programId is missing or invalid
âœ… **Tenant-Safe:** Still respects tenant isolation
âœ… **Logged:** Includes programId in error logging for debugging

## Testing

### Test Cases to Verify:

1. âœ… **Valid ProgramId:** `GET /api/project?programId=1` â†’ Should return only projects with ProgramId=1
2. âŒ **Missing ProgramId:** `GET /api/project` â†’ Should return 400 Bad Request
3. âŒ **Zero ProgramId:** `GET /api/project?programId=0` â†’ Should return 400 Bad Request
4. âŒ **Negative ProgramId:** `GET /api/project?programId=-1` â†’ Should return 400 Bad Request
5. âœ… **Non-existent ProgramId:** `GET /api/project?programId=999` â†’ Should return empty array (200 OK)

## Breaking Change Notice

âš ï¸ **BREAKING CHANGE:** This is a breaking change for any existing API consumers.

**Before:**
```
GET /api/project  // Returned all projects
```

**After:**
```
GET /api/project  // Returns 400 Bad Request
GET /api/project?programId=5  // Required - returns projects for program 5
```

**Migration Required:** All API consumers must update their calls to include `programId` parameter.

## Status
âœ… **Backend Implementation:** COMPLETE
â³ **Frontend Integration:** PENDING (next step)
â³ **Testing:** PENDING
â³ **Documentation:** PENDING

---
**Last Updated:** January 30, 2025
**Implemented By:** Kiro AI

