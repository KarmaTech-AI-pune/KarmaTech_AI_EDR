using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using EDR.Application.Exceptions;using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

namespace EDR.API.Middleware{
    /// <summary>
    /// Middleware to handle validation exceptions and return proper error responses
    /// </summary>
    public class ValidationExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ValidationExceptionMiddleware> _logger;

        public ValidationExceptionMiddleware(RequestDelegate next, ILogger<ValidationExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var response = exception switch
            {
                ValidationException validationEx => CreateValidationErrorResponse(validationEx),
                BudgetValidationException budgetEx => CreateBudgetValidationErrorResponse(budgetEx),
                UnauthorizedAccessException => CreateErrorResponse(
                    HttpStatusCode.Forbidden, 
                    "Access denied", 
                    "You do not have permission to perform this action"),
                ArgumentException argEx => CreateErrorResponse(
                    HttpStatusCode.BadRequest, 
                    "Invalid argument", 
                    argEx.Message),
                _ => CreateErrorResponse(
                    HttpStatusCode.InternalServerError, 
                    "Internal server error", 
                    "An unexpected error occurred")
            };

            context.Response.StatusCode = (int)response.StatusCode;

            _logger.LogError(exception, "Exception handled by ValidationExceptionMiddleware: {ExceptionType}", 
                exception.GetType().Name);

            var jsonResponse = JsonSerializer.Serialize(response.Body, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(jsonResponse);
        }

        private (HttpStatusCode StatusCode, object Body) CreateValidationErrorResponse(ValidationException validationException)
        {
            var errors = validationException.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray()
                );

            return (HttpStatusCode.BadRequest, new
            {
                Success = false,
                Message = "Validation failed",
                Errors = errors,
                StatusCode = 400,
                Timestamp = DateTime.UtcNow
            });
        }

        private (HttpStatusCode StatusCode, object Body) CreateBudgetValidationErrorResponse(BudgetValidationException budgetException)
        {
            var statusCode = budgetException.ErrorCode switch
            {
                BudgetValidationErrorCodes.ProjectNotFound => HttpStatusCode.NotFound,
                BudgetValidationErrorCodes.PermissionDenied => HttpStatusCode.Forbidden,
                _ => HttpStatusCode.BadRequest
            };

            return (statusCode, new
            {
                Success = false,
                Message = budgetException.Message,
                ErrorCode = budgetException.ErrorCode,
                Errors = budgetException.ValidationErrors,
                StatusCode = (int)statusCode,
                Timestamp = DateTime.UtcNow
            });
        }

        private (HttpStatusCode StatusCode, object Body) CreateErrorResponse(HttpStatusCode statusCode, string title, string message)
        {
            return (statusCode, new
            {
                Success = false,
                Message = message,
                Title = title,
                StatusCode = (int)statusCode,
                Timestamp = DateTime.UtcNow
            });
        }
    }
}
