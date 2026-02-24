# EDR Project Management Backend - Development Guide

## Prerequisites

### Software Requirements
- .NET 7.0 SDK
- SQL Server 2019 or later
- Visual Studio 2022 or Visual Studio Code
- Git

### Recommended Tools
- Azure Data Studio or SQL Server Management Studio
- Postman or Insomnia for API testing
- Docker (optional)

## Project Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/edr-project-management.git
cd edr-project-management/backend
```

### 2. Configure Database

#### Local SQL Server Setup
1. Install SQL Server
2. Create a new database:
```sql
CREATE DATABASE EDR.APIProjectManagement
```

#### Connection String Configuration
Update `appsettings.json` or use user secrets:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost,1433;Database=EDR.APIProjectManagement;User Id=sa;Password=YourPassword;TrustServerCertificate=True"
}
```

### 3. Database Migrations

#### Initial Migration
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 4. Install Dependencies
```bash
dotnet restore
```

## Running the Application

### Development Mode
```bash
dotnet run --environment Development
```

### Launch Profiles
- Use Visual Studio launch configurations
- Use `dotnet run` with specific environment

## Authentication

### Default Admin Credentials
- Username: admin
- Email: admin@edr.com
- Password: EDRAdmin@2024!

### Roles
- Admin: Full system access
- ProjectManager: Project management
- Analyst: Data analysis
- Viewer: Read-only access

## Development Workflow

### Branch Strategy
- `main`: Stable release
- `develop`: Integration branch
- `feature/`: New features
- `bugfix/`: Bug corrections
- `hotfix/`: Critical fixes

### Commit Guidelines
- Use conventional commits
- Descriptive commit messages
- Atomic commits

## Testing

### Running Tests
```bash
dotnet test
```

### Test Coverage
- Unit Tests: Business logic
- Integration Tests: Database interactions
- API Tests: Endpoint validation

## Code Quality

### Static Analysis
- Use SonarQube
- Enable code style rules
- Maintain high code coverage

### Recommended Extensions
- C# DevKit
- GitLens
- REST Client
- Docker

## Debugging

### Logging
- Use built-in logging mechanisms
- Configure log levels in `appsettings.json`

### Troubleshooting
- Check connection strings
- Verify database migrations
- Review application logs

## Deployment Preparation

### Environment Configurations
- Manage different `appsettings` files
- Use environment variables for secrets
- Configure production settings securely

## Performance Optimization

### Caching
- Implement distributed caching
- Use in-memory caching for frequent queries

### Database Performance
- Create appropriate indexes
- Use eager/lazy loading wisely
- Optimize Entity Framework queries

## Security Considerations

- Never commit secrets
- Use Azure Key Vault or similar
- Rotate credentials regularly
- Enable HTTPS

## Continuous Integration

### GitHub Actions
- Automated builds
- Run tests
- Generate coverage reports

## Contribution Guidelines

1. Fork the repository
2. Create a feature branch
3. Write tests
4. Implement feature
5. Run tests
6. Submit pull request

## Troubleshooting

### Common Issues
- Dependency conflicts
- Migration errors
- Authentication problems

### Getting Help
- Check documentation
- Review error logs
- Open GitHub issues

## Additional Resources

- [.NET Documentation](https://docs.microsoft.com/dotnet)
- [Entity Framework Core](https://docs.microsoft.com/ef)
- [ASP.NET Core](https://docs.microsoft.com/aspnet)

## License
[Specify your project's license]

