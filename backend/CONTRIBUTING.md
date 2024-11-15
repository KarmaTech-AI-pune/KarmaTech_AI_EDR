# Contributing to NJS Project Management Backend

## Welcome Contributors!

We appreciate your interest in contributing to the NJS Project Management Backend. This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Collaborate openly and transparently

## Getting Started

### Prerequisites
- .NET 7.0 SDK
- SQL Server
- Git
- Visual Studio 2022 or VS Code

### Development Environment Setup
1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Set up local development environment
5. Run tests before making changes

## Contribution Process

### 1. Issue Tracking
- Check existing issues before creating new ones
- Use clear, descriptive titles
- Provide detailed context for bugs or features

### 2. Branch Naming Conventions
- `feature/`: New features
- `bugfix/`: Bug corrections
- `hotfix/`: Critical fixes
- `docs/`: Documentation updates

Example: `feature/add-user-roles`

### 3. Commit Guidelines
#### Conventional Commits Standard
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

##### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting
- `refactor`: Code restructuring
- `test`: Adding/modifying tests
- `chore`: Maintenance tasks

Example:
```
feat(auth): add multi-factor authentication

- Implement MFA using time-based one-time passwords
- Add configuration for MFA in settings
- Update user model to support MFA
```

### 4. Pull Request Process
1. Ensure code passes all tests
2. Update documentation
3. Add descriptive PR title and description
4. Link related issues

### 5. Code Review Criteria
- Clean, readable code
- Follows project coding standards
- Comprehensive test coverage
- No unnecessary complexity
- Adheres to SOLID principles

## Coding Standards

### C# Specific Guidelines
- Use C# 10 and .NET 7.0 features
- Follow Microsoft's C# coding conventions
- Use nullable reference types
- Prefer immutability
- Write XML documentation comments

### Architecture Principles
- Maintain clean architecture
- Use dependency injection
- Implement repository and service patterns
- Keep controllers thin
- Separate concerns

## Testing

### Test Coverage
- Unit tests for business logic
- Integration tests for database interactions
- API endpoint tests
- Aim for >80% code coverage

### Running Tests
```bash
dotnet test
```

## Performance and Security

- Optimize database queries
- Use asynchronous programming
- Implement proper error handling
- Follow OWASP security guidelines
- Never expose sensitive information

## Documentation

- Update README and other docs
- Add comments for complex logic
- Keep documentation current
- Use markdown for readability

## Continuous Integration

- GitHub Actions will run tests
- Code must pass all checks
- Maintain build stability

## Reporting Issues

### Bug Reports
- Describe steps to reproduce
- Include environment details
- Provide error logs
- Suggest potential fixes

### Feature Requests
- Explain the use case
- Provide potential implementation ideas
- Discuss potential impact

## Advanced Contributions

### Performance Optimization
- Profile code
- Identify bottlenecks
- Suggest improvements

### Security Enhancements
- Conduct security reviews
- Report vulnerabilities responsibly
- Propose security improvements

## Communication Channels

- GitHub Issues
- Project Discussion Forums
- Email: contribute@njs-project.com

## Licensing

By contributing, you agree to license your contributions under the project's existing license.

## Recognition

Contributors will be acknowledged in:
- README
- Contributors list
- Release notes

## Thank You!

Your contributions help improve the NJS Project Management Backend for everyone.
