using System;
using System.Collections.Generic;

namespace EDR.Application.Exceptions
{
    /// <summary>
    /// Exception thrown when budget validation fails
    /// </summary>
    public class BudgetValidationException : Exception
    {
        public string ErrorCode { get; }
        public Dictionary<string, string> ValidationErrors { get; }

        public BudgetValidationException(string errorCode, string message) 
            : base(message)
        {
            ErrorCode = errorCode;
            ValidationErrors = new Dictionary<string, string>();
        }

        public BudgetValidationException(string errorCode, string message, Dictionary<string, string> validationErrors) 
            : base(message)
        {
            ErrorCode = errorCode;
            ValidationErrors = validationErrors ?? new Dictionary<string, string>();
        }

        public BudgetValidationException(string errorCode, string message, Exception innerException) 
            : base(message, innerException)
        {
            ErrorCode = errorCode;
            ValidationErrors = new Dictionary<string, string>();
        }
    }

    /// <summary>
    /// Common budget validation error codes
    /// </summary>
    public static class BudgetValidationErrorCodes
    {
        public const string NoChanges = "BUDGET_NO_CHANGES";
        public const string InvalidValues = "BUDGET_INVALID_VALUES";
        public const string PermissionDenied = "BUDGET_PERMISSION_DENIED";
        public const string ProjectNotFound = "BUDGET_PROJECT_NOT_FOUND";
        public const string InvalidFieldName = "BUDGET_INVALID_FIELD_NAME";
        public const string ReasonTooLong = "BUDGET_REASON_TOO_LONG";
        public const string NegativeValue = "BUDGET_NEGATIVE_VALUE";
    }
}
