# NJS Project Management - Configuration Management

## Overview

The application uses a multi-environment configuration approach with JSON-based settings files.

### Configuration Files

1. `appsettings.json`: Base configuration
2. `appsettings.Development.json`: Development-specific settings
3. `appsettings.Production.json`: Production-specific settings

## Configuration Sections

### 1. Logging
- Control logging levels for different environments
- Adjust verbosity and error reporting

### 2. JWT Authentication
- Configure token generation
- Set issuer, audience, and expiration
- Manage encryption key

### 3. Identity Settings
#### Password Policy
- Complexity requirements
- Length and unique character constraints

#### Lockout Settings
- Failed login attempt management
- Lockout duration and conditions

#### User Settings
- Email uniqueness
- Allowed username characters

### 4. Connection Strings
- Database connection configuration
- Environment-specific database settings

### 5. CORS Settings
- Allowed origins
- Cross-origin resource sharing configuration

### 6. Security Features

#### Development Environment
- Relaxed password requirements
- Longer token expiration
- Detailed error reporting
- Test data seeding

#### Production Environment
- Strict password policies
- Short token expiration
- Minimal error details
- HTTPS enforcement
- Strict transport security

## Best Practices

1. Never commit sensitive information to version control
2. Use environment variables for secrets
3. Rotate encryption keys regularly
4. Implement different connection strings per environment

## Environment-Specific Configurations

### Development
- Relaxed security settings
- Verbose logging
- Local database connection
- Swagger enabled

### Production
- Strict security settings
- Minimal logging
- Secure database connection
- Swagger disabled

## Recommended Setup

1. Use `dotnet user-secrets` for local development secrets
2. Use environment variables in production
3. Implement secure key management
4. Regularly audit and rotate credentials

## Security Recommendations

- Use strong, unique passwords
- Implement multi-factor authentication
- Regularly update dependencies
- Monitor and log authentication events
