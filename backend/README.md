# NJS Project Management Backend

## Overview

NJS Project Management Backend is a robust, scalable .NET Core application designed to provide comprehensive project management capabilities with a focus on security, performance, and extensibility.

### Key Features

- 🔐 Secure Authentication
  - Role-based access control
  - JWT token authentication
  - Multi-role support

- 📊 Project Management
  - Comprehensive project tracking
  - Feasibility study management
  - Go/No-Go decision workflows

- 🛡️ Advanced Security
  - Identity Core integration
  - Configurable password policies
  - Secure token management

- 🚀 Modern Architecture
  - Clean architecture
  - Dependency injection
  - Repository pattern
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
├── src/
│   ├── NJS.Application/     # Application services
│   ├── NJS.Domain/          # Domain models and entities
│   ├── NJS.Infrastructure/  # Cross-cutting concerns
│   ├── NJS.Repositories/    # Data access layer
│   └── NJSAPI/              # Web API controllers
├── tests/                   # Unit and integration tests
├── Configuration.md         # Detailed configuration guide
├── Security.md              # Security guidelines
├── DEVELOPMENT.md           # Development setup instructions
└── CONTRIBUTING.md          # Contribution guidelines
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
  - Email: `admin@njs.com`
  - Password: `NJSAdmin@2024!`

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
- Email: contact@njs-project.com
