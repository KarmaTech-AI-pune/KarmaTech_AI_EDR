# INTEGRATION GUIDE

## Overview

The KarmaTech AI EDR application integrates with several external services and systems to provide comprehensive project management capabilities. This document covers all integration points, data formats, sync mechanisms, error handling, and troubleshooting.

## Integration Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                    KarmaTech AI EDR Application                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐      ┌─────────────────┐                     │
│  │  C# .NET Core   │      │   Node.js       │                     │
│  │   Backend API   │      │   Backend API   │                     │
│  └────────┬────────┘      └────────┬────────┘                     │
│           │                         │                               │
└───────────┼─────────────────────────┼───────────────────────────────┘
            │                         │
            │                         │
            ▼                         ▼
┌────────────────────────┐  ┌─────────────────────┐
│   SQL Server Database  │  │  MongoDB Atlas      │
│   (Primary)            │  │  (Complementary)    │
└────────────────────────┘  └─────────────────────┘
            │
            │
            ├──────────────────────────────────────────────────────┐
            │                                                      │
            ▼                                                      ▼
┌────────────────────────┐                            ┌─────────────────────┐
│  Email Service (SMTP)  │                            │  Excel Export       │
│  - Gmail SMTP          │                            │  - ClosedXML        │
│  - Port 587 TLS        │                            │  - .xlsx format     │
└────────────────────────┘                            └─────────────────────┘
```

## 1. Email Service Integration (SMTP)

### 1.1. Overview

The application uses **MailKit** library to send email notifications via Gmail SMTP server.

**Purpose**:
- User notifications (registration, password reset)
- Workflow approvals (opportunity submissions, project approvals)
- Monthly progress reminders
- Project closure notifications
- System alerts

### 1.2. Configuration

**Location**: `backend/src/NJSAPI/appsettings.json`

```json
{
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "Port": 587,
    "Username": "dishadais2025@gmail.com",
    "Password": "grstgibxcsxhjyrz",
    "FromEmail": "dishadais2025@gmail.com",
    "FromName": "NJS Project Management",
    "EnableSsl": true,
    "EnableEmailNotifications": true
  }
}
```

**Configuration Parameters**:

| Parameter | Value | Description |
|-----------|-------|-------------|
| SmtpServer | smtp.gmail.com | SMTP server address |
| Port | 587 | SMTP port (STARTTLS) |
| Username | dishadais2025@gmail.com | SMTP authentication username |
| Password | grstgibxcsxhjyrz | App-specific password (NOT Gmail password) |
| FromEmail | dishadais2025@gmail.com | Sender email address |
| FromName | NJS Project Management | Sender display name |
| EnableSsl | true | Enable TLS/SSL encryption |
| EnableEmailNotifications | true | Global email toggle |

### 1.3. Email Service Implementation

**File**: `backend/src/NJS.Application/Services/EmailService.cs`

**Key Methods**:

```csharp
public interface IEmailService
{
    Task<bool> SendEmailAsync(string to, string subject, string body);
    Task<bool> SendEmailWithAttachmentAsync(string to, string subject, string body, byte[] attachment, string fileName);
    Task<bool> SendNotificationAsync(string userId, string template, Dictionary<string, string> data);
}
```

**Implementation Example**:

```csharp
public async Task<bool> SendEmailAsync(string to, string subject, string body)
{
    try
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(
            _emailSettings.FromName,
            _emailSettings.FromEmail
        ));
        message.To.Add(new MailboxAddress("", to));
        message.Subject = subject;

        var builder = new BodyBuilder
        {
            HtmlBody = body
        };
        message.Body = builder.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(
            _emailSettings.SmtpServer,
            _emailSettings.Port,
            SecureSocketOptions.StartTls
        );

        await client.AuthenticateAsync(
            _emailSettings.Username,
            _emailSettings.Password
        );

        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        _logger.LogInformation($"Email sent successfully to {to}");
        return true;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"Failed to send email to {to}");

        // Log failed email to database
        await LogFailedEmailAsync(to, subject, body, ex.Message);

        return false;
    }
}
```

### 1.4. Email Templates

Email templates are defined in code (not externalized).

**Opportunity Submission Email**:
```html
<html>
<body>
  <h2>Opportunity Submitted for Review</h2>
  <p>Dear {ManagerName},</p>
  <p>A new opportunity has been submitted for your review:</p>
  <ul>
    <li><strong>Title:</strong> {OpportunityTitle}</li>
    <li><strong>Client:</strong> {ClientName}</li>
    <li><strong>Estimated Revenue:</strong> ${EstimatedRevenue}</li>
    <li><strong>Submitted By:</strong> {SubmitterName}</li>
  </ul>
  <p>Please review and approve/reject at your earliest convenience.</p>
  <p><a href="{ReviewUrl}">Review Opportunity</a></p>
  <p>Best regards,<br/>NJS Project Management System</p>
</body>
</html>
```

**Project Approval Email**:
```html
<html>
<body>
  <h2>Project Approved</h2>
  <p>Dear {UserName},</p>
  <p>Your project has been approved:</p>
  <ul>
    <li><strong>Project:</strong> {ProjectName}</li>
    <li><strong>Approved By:</strong> {ApproverName}</li>
    <li><strong>Approval Date:</strong> {ApprovalDate}</li>
  </ul>
  <p>You can now proceed with project initiation.</p>
  <p><a href="{ProjectUrl}">View Project</a></p>
  <p>Best regards,<br/>NJS Project Management System</p>
</body>
</html>
```

### 1.5. Data Format

**Email Trigger Events**:

| Event | Trigger | Recipients | Template |
|-------|---------|-----------|----------|
| User Registration | New user created | New user | Welcome email |
| Password Reset | Password reset requested | User | Password reset link |
| Opportunity Submitted | Opportunity submitted for approval | Approval manager | Opportunity review |
| Opportunity Approved | Opportunity approved | Submitter | Approval notification |
| Opportunity Rejected | Opportunity rejected | Submitter | Rejection notification |
| Project Milestone | Milestone achieved | Project team | Milestone notification |
| Monthly Progress Due | End of month | Project managers | Progress reminder |
| Project Closure | Project closed | Stakeholders | Closure notification |

### 1.6. Sync Mechanism

**Email Sending**: Synchronous (blocks request until email sent)

**Recommendation**: Implement asynchronous background job processing using:
- Hangfire
- Azure Service Bus
- RabbitMQ

**Current Flow**:
```
User Action → API Endpoint → Email Service → SMTP Server → Email Sent
  (blocking)      (sync)         (sync)          (sync)
```

**Recommended Flow**:
```
User Action → API Endpoint → Queue Message → Background Worker → Email Service → SMTP Server
  (instant)      (async)      (instant)       (async)           (async)
```

### 1.7. Error Handling

**Failed Email Logging**:

When email sending fails, the error is logged to the `FailedEmailLog` table.

**Schema**:
```sql
CREATE TABLE FailedEmailLog (
    Id INT PRIMARY KEY IDENTITY,
    ToEmail NVARCHAR(255) NOT NULL,
    Subject NVARCHAR(500) NOT NULL,
    Body NVARCHAR(MAX) NULL,
    ErrorMessage NVARCHAR(MAX) NULL,
    AttemptedAt DATETIME NOT NULL,
    RetryCount INT NOT NULL DEFAULT 0
)
```

**Retry Mechanism** (Not currently implemented):

Recommended implementation:
1. Log failed email to database
2. Background job checks `FailedEmailLog` every 5 minutes
3. Retry up to 3 times with exponential backoff
4. After 3 failures, mark as permanently failed and alert admin

### 1.8. Troubleshooting

#### Issue: Email not sending

**Possible Causes**:
1. Invalid SMTP credentials
2. Gmail blocking less secure apps
3. Network/firewall issues
4. Invalid recipient email

**Diagnosis**:
```csharp
// Enable detailed logging
_logger.LogDebug($"Connecting to {_emailSettings.SmtpServer}:{_emailSettings.Port}");
_logger.LogDebug($"Authenticating as {_emailSettings.Username}");
```

**Resolution**:
1. Verify SMTP credentials in appsettings.json
2. Ensure using Gmail App Password (not regular password)
3. Check `FailedEmailLog` table for error details
4. Test SMTP connection manually:
```bash
telnet smtp.gmail.com 587
```

#### Issue: Gmail "Less secure app access" error

**Resolution**:
1. Use App Password instead of regular password
2. Enable 2FA on Gmail account
3. Generate App Password: https://myaccount.google.com/apppasswords

#### Issue: Emails going to spam

**Resolution**:
1. Configure SPF record for sending domain
2. Configure DKIM signature
3. Use verified sender email address
4. Avoid spam trigger words in subject/body

### 1.9. Testing Email Integration

**Unit Test Example**:

```csharp
[Test]
public async Task SendEmailAsync_ValidRecipient_ReturnsTrue()
{
    // Arrange
    var emailService = new EmailService(_emailSettings, _logger);
    var to = "test@example.com";
    var subject = "Test Email";
    var body = "<p>This is a test email</p>";

    // Act
    var result = await emailService.SendEmailAsync(to, subject, body);

    // Assert
    Assert.IsTrue(result);
}
```

**Integration Test**:
```bash
# Send test email via API
curl -X POST http://localhost:5245/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "<p>Test</p>"
  }'
```

---

## 2. Excel Export Integration

### 2.1. Overview

The application uses **ClosedXML** library to generate Excel reports in `.xlsx` format (Office Open XML).

**Purpose**:
- Monthly progress report exports
- Project status reports
- Budget tracking reports
- Resource allocation reports
- Custom data exports

### 2.2. Configuration

**Library**: ClosedXML 0.102.1

**Installation**:
```xml
<PackageReference Include="ClosedXML" Version="0.102.1" />
```

### 2.3. Implementation

**File**: `backend/src/NJSAPI/Controllers/ExcelController.cs`

**Endpoint**: `POST /api/excel/monthly-progress/{progressId}`

**Implementation Example**:

```csharp
[HttpPost("monthly-progress/{progressId}")]
public async Task<IActionResult> ExportMonthlyProgress(int progressId)
{
    try
    {
        var progress = await _monthlyProgressRepository.GetByIdAsync(progressId);

        if (progress == null)
        {
            return NotFound($"Monthly progress {progressId} not found");
        }

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Monthly Progress");

        // Header styling
        var headerRange = worksheet.Range("A1:F1");
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.LightBlue;

        // Headers
        worksheet.Cell(1, 1).Value = "Project Name";
        worksheet.Cell(1, 2).Value = "Month/Year";
        worksheet.Cell(1, 3).Value = "Budget Staff";
        worksheet.Cell(1, 4).Value = "Budget ODCs";
        worksheet.Cell(1, 5).Value = "Fee Total";
        worksheet.Cell(1, 6).Value = "Percent Complete";

        // Data
        worksheet.Cell(2, 1).Value = progress.Project.ProjectName;
        worksheet.Cell(2, 2).Value = $"{progress.Month}/{progress.Year}";
        worksheet.Cell(2, 3).Value = progress.FinancialDetails?.BudgetStaff ?? 0;
        worksheet.Cell(2, 4).Value = progress.FinancialDetails?.BudgetOdcs ?? 0;
        worksheet.Cell(2, 5).Value = progress.FinancialDetails?.FeeTotal ?? 0;
        worksheet.Cell(2, 6).Value = $"{progress.Schedule?.PercentComplete ?? 0}%";

        // Format currency
        worksheet.Range("C2:E2").Style.NumberFormat.Format = "$#,##0.00";

        // Auto-fit columns
        worksheet.Columns().AdjustToContents();

        // Generate file
        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        var content = stream.ToArray();

        var fileName = $"MonthlyProgress_{progress.Project.ProjectNumber}_{progress.Month}_{progress.Year}.xlsx";

        return File(
            content,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileName
        );
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"Error exporting monthly progress {progressId}");
        return StatusCode(500, "Error generating Excel file");
    }
}
```

### 2.4. Data Format

**Excel File Structure**:

**Sheet 1: Monthly Progress Summary**
| Project Name | Month/Year | Budget Staff | Budget ODCs | Fee Total | Percent Complete |
|--------------|------------|--------------|-------------|-----------|------------------|
| Airport Terminal | 10/2024 | $150,000 | $50,000 | $20,000 | 42.5% |

**Sheet 2: Financial Details** (if included)
| Category | Prior Cumulative | This Month | Total Cumulative |
|----------|------------------|------------|------------------|
| Staff | $1,200,000 | $148,000 | $1,348,000 |
| ODCs | $450,000 | $52,000 | $502,000 |

**Sheet 3: Schedule** (if included)
| Milestone | Planned Date | Actual Date | Status |
|-----------|--------------|-------------|--------|
| Design Complete | 6/30/2024 | 6/28/2024 | Completed |
| Construction Start | 7/1/2024 | 7/5/2024 | Completed |

### 2.5. Styling and Formatting

**ClosedXML Features Used**:

```csharp
// Font styling
worksheet.Cell(1, 1).Style.Font.Bold = true;
worksheet.Cell(1, 1).Style.Font.FontSize = 14;
worksheet.Cell(1, 1).Style.Font.FontColor = XLColor.White;

// Background color
worksheet.Cell(1, 1).Style.Fill.BackgroundColor = XLColor.DarkBlue;

// Alignment
worksheet.Cell(1, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
worksheet.Cell(1, 1).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

// Number formatting
worksheet.Cell(2, 3).Style.NumberFormat.Format = "$#,##0.00"; // Currency
worksheet.Cell(2, 4).Style.NumberFormat.Format = "0.00%"; // Percentage
worksheet.Cell(2, 5).Style.NumberFormat.Format = "mm/dd/yyyy"; // Date

// Borders
worksheet.Range("A1:F10").Style.Border.OutsideBorder = XLBorderStyleValues.Thick;
worksheet.Range("A1:F10").Style.Border.InsideBorder = XLBorderStyleValues.Thin;

// Auto-fit columns
worksheet.Columns().AdjustToContents();

// Freeze panes
worksheet.SheetView.FreezeRows(1); // Freeze header row
```

### 2.6. Error Handling

**Common Errors**:

| Error | Cause | Resolution |
|-------|-------|------------|
| OutOfMemoryException | Large dataset | Implement pagination or streaming |
| InvalidOperationException | Invalid cell reference | Validate row/column indexes |
| IOException | File locked | Ensure stream disposal with `using` |
| FormatException | Invalid number format | Validate data types before writing |

**Error Handling Pattern**:

```csharp
try
{
    using var workbook = new XLWorkbook();
    // Excel generation logic

    using var stream = new MemoryStream();
    workbook.SaveAs(stream);
    return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
}
catch (Exception ex)
{
    _logger.LogError(ex, "Error generating Excel file");
    return StatusCode(500, new { message = "Error generating Excel file", error = ex.Message });
}
```

### 2.7. Frontend Integration

**Frontend Excel Download** (using Axios):

```typescript
// File: frontend/src/services/excelApi.tsx

export const downloadMonthlyProgressExcel = async (progressId: number) => {
  try {
    const response = await axios.post(
      `/api/excel/monthly-progress/${progressId}`,
      {},
      {
        responseType: 'blob', // Important for binary data
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    const fileName = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : `MonthlyProgress_${progressId}.xlsx`;

    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Error downloading Excel file:', error);
    return { success: false, error };
  }
};
```

**React Component Usage**:

```typescript
const handleExportClick = async () => {
  setLoading(true);
  const result = await downloadMonthlyProgressExcel(progressId);

  if (result.success) {
    showNotification('Excel file downloaded successfully', 'success');
  } else {
    showNotification('Failed to download Excel file', 'error');
  }

  setLoading(false);
};
```

### 2.8. Performance Considerations

**Large Dataset Handling**:

For large datasets (1000+ rows), consider:

1. **Streaming Approach**:
```csharp
public async Task<IActionResult> ExportLargeDataset()
{
    var stream = new MemoryStream();
    using var workbook = new XLWorkbook();
    var worksheet = workbook.Worksheets.Add("Data");

    // Stream data in batches
    int batchSize = 1000;
    int currentRow = 2;

    await foreach (var batch in GetDataInBatchesAsync(batchSize))
    {
        foreach (var item in batch)
        {
            worksheet.Cell(currentRow, 1).Value = item.Property1;
            worksheet.Cell(currentRow, 2).Value = item.Property2;
            currentRow++;
        }
    }

    workbook.SaveAs(stream);
    return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "data.xlsx");
}
```

2. **Background Job Processing**:
```csharp
// Queue export job
var jobId = BackgroundJob.Enqueue(() => GenerateExcelAsync(progressId));

// Notify user when complete
BackgroundJob.ContinueJobWith(jobId, () => SendExcelReadyEmail(userId));
```

---

## 3. MongoDB Integration (Node.js Backend)

### 3.1. Overview

The Node.js backend provides complementary services using MongoDB for alternative data models.

**Purpose**:
- Alternative data exploration
- Real-time features (future)
- Analytics and reporting (future)
- Caching layer (potential)

### 3.2. Configuration

**File**: `node-backend/.env`

```bash
MONGODB_URI=mongodb+srv://username:password@karmatechai.mpkpl.mongodb.net/KarmaTechAI?retryWrites=true&w=majority
JWT_SECRET=your-jwt-secret-key
PORT=3000
NODE_ENV=development
```

**Database Connection**: `node-backend/src/config/database.ts`

```typescript
import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || '';

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected successfully');

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};
```

### 3.3. Data Models

**User Model**: `node-backend/src/models/User.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, required: true, default: 'User' },
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
```

**Project Model**: `node-backend/src/models/Project.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  projectName: string;
  projectNumber: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: string;
  estimatedCost: number;
  estimatedFee: number;
  projectManager: string;
  regionId: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
  projectName: { type: String, required: true },
  projectNumber: { type: String, unique: true },
  description: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, default: 'Active' },
  estimatedCost: { type: Number, default: 0 },
  estimatedFee: { type: Number, default: 0 },
  projectManager: { type: String },
  regionId: { type: Number },
}, {
  timestamps: true
});

export default mongoose.model<IProject>('Project', ProjectSchema);
```

### 3.4. Data Synchronization

**Current State**: No automatic synchronization between SQL Server and MongoDB.

**Data Flow**:
- SQL Server: Primary data source
- MongoDB: Independent data model

**Future Synchronization Options**:

1. **Event-Driven Sync**:
```csharp
// Publish event when project created in SQL Server
await _eventBus.PublishAsync(new ProjectCreatedEvent {
    ProjectId = project.ProjectId,
    ProjectData = project
});

// Node.js subscribes to event and creates in MongoDB
eventBus.subscribe('ProjectCreated', async (event) => {
    const project = new Project(event.ProjectData);
    await project.save();
});
```

2. **Scheduled Sync**:
```typescript
// Run every hour
cron.schedule('0 * * * *', async () => {
    await syncProjectsFromSqlServer();
});
```

3. **Change Data Capture (CDC)**:
- Enable CDC on SQL Server tables
- Process change stream
- Apply changes to MongoDB

### 3.5. API Endpoints

**Node.js Endpoints**: `node-backend/src/routes/projectRoutes.ts`

```
GET    /api/projects           - Get all projects
GET    /api/projects/:id       - Get project by ID
POST   /api/projects           - Create project
PUT    /api/projects/:id       - Update project
DELETE /api/projects/:id       - Delete project
GET    /api/projects/:id/wbs   - Get WBS for project
```

### 3.6. Error Handling

**MongoDB Error Handling**:

```typescript
export const createProject = async (req: Request, res: Response) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json({ success: true, project });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      res.status(409).json({
        success: false,
        message: 'Project number already exists'
      });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};
```

---

## 4. SQL Server Database Integration

### 4.1. Connection Configuration

**Connection String** (Development):
```
Server=localhost;Database=KarmaTechAI_SAAS;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;
```

**Connection String** (Production):
```
Server=production-server;Database=KarmaTechAI_SAAS;User Id=dbuser;Password=SecurePassword;TrustServerCertificate=True;MultipleActiveResultSets=true;Encrypt=true;
```

### 4.2. Entity Framework Core Configuration

**DbContext Setup**: `backend/src/NJS.Domain/Extensions/ServiceCollectionExtensions.cs`

```csharp
services.AddDbContext<ProjectManagementContext>(options =>
{
    options.UseSqlServer(
        configuration.GetConnectionString("AppDbConnection"),
        sqlServerOptions =>
        {
            sqlServerOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null
            );
            sqlServerOptions.CommandTimeout(30);
            sqlServerOptions.MigrationsAssembly("NJS.Domain");
        }
    );

    options.AddInterceptors(
        serviceProvider.GetRequiredService<AuditSaveChangesInterceptor>()
    );
});
```

### 4.3. Connection Resilience

**Retry Logic**:
- Maximum 5 retry attempts
- Exponential backoff up to 30 seconds
- Retries on transient SQL errors

**Transient Errors** (automatically retried):
- Connection timeout
- Deadlock
- Network errors

### 4.4. Error Handling

**DbUpdateException**:
```csharp
try
{
    await _context.SaveChangesAsync();
}
catch (DbUpdateException ex)
{
    if (ex.InnerException is SqlException sqlEx)
    {
        switch (sqlEx.Number)
        {
            case 2627: // Unique constraint violation
                return Conflict("Duplicate record");
            case 547: // Foreign key violation
                return BadRequest("Related record not found");
            default:
                throw;
        }
    }
    throw;
}
```

---

## 5. Future Integration Points

### 5.1. Azure Blob Storage (Recommended)

**Purpose**: File uploads (documents, attachments, images)

**Configuration**:
```json
{
  "AzureStorage": {
    "ConnectionString": "DefaultEndpointsProtocol=https;AccountName=...",
    "ContainerName": "project-documents"
  }
}
```

**Implementation**:
```csharp
public async Task<string> UploadFileAsync(IFormFile file)
{
    var blobClient = new BlobClient(
        _storageSettings.ConnectionString,
        _storageSettings.ContainerName,
        file.FileName
    );

    await blobClient.UploadAsync(file.OpenReadStream());

    return blobClient.Uri.ToString();
}
```

### 5.2. Azure Service Bus (Recommended)

**Purpose**: Asynchronous messaging, event-driven architecture

**Use Cases**:
- Email sending (decouple from API request)
- Data synchronization
- Background job processing
- Inter-service communication

### 5.3. Reporting Service (Power BI)

**Purpose**: Advanced analytics and reporting

**Integration**: Power BI REST API

---

## 6. Troubleshooting

### 6.1. Email Integration Issues

| Issue | Solution |
|-------|----------|
| SMTP authentication failed | Verify App Password, enable 2FA |
| Connection timeout | Check firewall, port 587 open |
| Emails not received | Check spam folder, verify recipient |

### 6.2. Excel Export Issues

| Issue | Solution |
|-------|----------|
| OutOfMemoryException | Implement streaming or pagination |
| File corrupted | Ensure proper stream disposal |
| Download fails in browser | Check CORS, content-type header |

### 6.3. MongoDB Issues

| Issue | Solution |
|-------|----------|
| Connection refused | Verify MongoDB URI, network access |
| Authentication failed | Check username/password |
| Slow queries | Add indexes on frequently queried fields |

---

**Document Version**: 1.0
**Last Updated**: 2025-10-30
**Maintained By**: Business Analyst Team
