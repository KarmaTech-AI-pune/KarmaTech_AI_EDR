using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Diagnostics;
using System.Collections.Generic;

namespace EDR.Application.Extensions;

public static class LoggerExtensions
{
    public static IDisposable BeginEmailScope(this ILogger logger, string message, string bodyMessage)
    {
        var state = new Dictionary<string, object>();

        if (!string.IsNullOrEmpty(message))
        {
            state["message"] = message;
        }

        if (!string.IsNullOrEmpty(bodyMessage))
        {
            try
            {
                var bodyObj = JsonSerializer.Deserialize<object>(bodyMessage);
                state["sentBodyMessage"] = bodyObj;
            }
            catch
            {
                state["sentBodyMessage"] = bodyMessage;
            }
        }

        return logger.BeginScope(state);
    }

    public static void LogEmailOperation(this ILogger logger, LogLevel level, string message, string bodyMessage, Exception? exception = null)
    {
        using (logger.BeginEmailScope(message, bodyMessage))
        {
            var state = new Dictionary<string, object>
            {
                ["@timestamp"] = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"),
                ["@level"] = level.ToString().ToUpper(),
                ["@logger"] = logger.GetType().Name,
                ["@correlationId"] = Activity.Current?.Id ?? string.Empty,
                ["@exception"] = exception?.ToString()
            };

            logger.Log(
                level,
                exception,
                "{@timestamp}|{@level}|{@logger}|{@correlationId}|{@exception}",
                state["@timestamp"],
                state["@level"],
                state["@logger"],
                state["@correlationId"],
                state["@exception"]
            );
        }
    }
}

