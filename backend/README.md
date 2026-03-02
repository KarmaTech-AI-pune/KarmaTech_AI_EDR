# EDR Project Management Backend

## Overview

EDR Project Management Backend is a robust, scalable .NET Core application designed to provide comprehensive project management capabilities with a focus on security, performance, and extensibility.

### Key Features

- ðŸ” Secure Authentication
  - Role-based access control
  - JWT token authentication
  - Multi-role support

- ðŸ“Š Project Management
  - Comprehensive project tracking
  - Feasibility study management
  - Go/No-Go decision workflows

- ðŸ›¡ï¸ Advanced Security
  - Identity Core integration
  - Configurable password policies
  - Secure token management

- ðŸš€ Modern Architecture
  - Clean architecture
  - CQRS (Command Query Responsibility Segregation)
  - MediatR for implementing the mediator pattern
  - Repository pattern
  - Unit of Work pattern
  - Dependency injection
  - MVC framework
  - Code First approach
  - Entity Framework Core

## Technology Stack

- **Language**: C# 10
- **Framework**: .NET 7.0
- **ORM**: Entity Framework Core
- **Authentication**: ASP.NET Core Identity
- **Database**: SQL Server
- **Logging**: Microsoft.Extensions.Logging

## Project Structure

```
backend/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ EDR.Application/     # Application services
â”‚   â”œâ”€â”€ EDR.Domain/          # Domain models and entities
â”‚   â”œâ”€â”€ EDR.Infrastructure/  # Cross-cutting concerns
â”‚   â”œâ”€â”€ EDR.Repositories/    # Data access layer
â”‚   â””â”€â”€ EDR.API/              # Web API controllers
â”œâ”€â”€ tests/                   # Unit and integration tests
â”œâ”€â”€ Configuration.md         # Detailed configuration guide
â”œâ”€â”€ Security.md              # Security guidelines
â”œâ”€â”€ DEVELOPMENT.md           # Development setup instructions
â””â”€â”€ CONTRIBUTING.md          # Contribution guidelines
```

## Quick Start

### Prerequisites
- .NET 7.0 SDK
- SQL Server
- Visual Studio 2022 or VS Code

### Setup Steps
1. Clone the repository
2. Configure database connection in `appsettings.json`
3. Run database migrations
4. Start the application

```bash
# Install dependencies
dotnet restore

# Run migrations
dotnet ef database update

# Launch development server
dotnet run
```

## Documentation

- [Configuration Guide](Configuration.md)
- [Security Guidelines](Security.md)
- [Development Setup](DEVELOPMENT.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## Authentication

- Default Admin Credentials
  - Username: `admin`
  - Email: `admin@edr.com`
  - Password: `EDRAdmin@2024!`

### Roles
- **Admin**: Full system access
- **ProjectManager**: Project management
- **Analyst**: Data analysis
- **Viewer**: Read-only access

## API Endpoints

### Authentication
- `POST /api/user/login`: User authentication
- `POST /api/user/register`: User registration
- `GET /api/user/me`: Get current user profile
- `POST /api/user/change-password`: Update password

### Project Management
- `GET /api/projects`: List projects
- `POST /api/projects`: Create project
- `GET /api/projects/{id}`: Get project details

## Testing

```bash
# Run unit tests
dotnet test
```

## Deployment

- Supports multiple environments
- Configurable through `appsettings` files
- Docker support (coming soon)

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before getting started.

## License

[Specify your project's license]

## Contact

- Project Lead: [Your Name]
- Email: contact@edr-project.com

