using System;
using System.Collections.Generic;

namespace EDR.Application.Dtos
{
    /// <summary>
    /// Standard API response wrapper for consistent response format
    /// </summary>
    /// <typeparam name="T">The type of data being returned</typeparam>
    public class ApiResponseDto<T>
    {
        /// <summary>
        /// Indicates if the operation was successful
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Human-readable message describing the result
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// The actual data payload
        /// </summary>
        public T? Data { get; set; }

        /// <summary>
        /// Validation or other errors
        /// </summary>
        public Dictionary<string, string[]>? Errors { get; set; }

        /// <summary>
        /// HTTP status code
        /// </summary>
        public int StatusCode { get; set; }

        /// <summary>
        /// Timestamp of the response
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Creates a successful response
        /// </summary>
        public static ApiResponseDto<T> SuccessResponse(T data, string message = "Operation completed successfully")
        {
            return new ApiResponseDto<T>
            {
                Success = true,
                Message = message,
                Data = data,
                StatusCode = 200
            };
        }

        /// <summary>
        /// Creates an error response
        /// </summary>
        public static ApiResponseDto<T> ErrorResponse(string message, int statusCode = 400, Dictionary<string, string[]>? errors = null)
        {
            return new ApiResponseDto<T>
            {
                Success = false,
                Message = message,
                StatusCode = statusCode,
                Errors = errors
            };
        }
    }

    /// <summary>
    /// Standard API response wrapper without data payload
    /// </summary>
    public class ApiResponseDto : ApiResponseDto<object>
    {
        /// <summary>
        /// Creates a successful response without data
        /// </summary>
        public static ApiResponseDto SuccessResponse(string message = "Operation completed successfully")
        {
            return new ApiResponseDto
            {
                Success = true,
                Message = message,
                StatusCode = 200
            };
        }

        /// <summary>
        /// Creates an error response without data
        /// </summary>
        public new static ApiResponseDto ErrorResponse(string message, int statusCode = 400, Dictionary<string, string[]>? errors = null)
        {
            return new ApiResponseDto
            {
                Success = false,
                Message = message,
                StatusCode = statusCode,
                Errors = errors
            };
        }
    }
}
