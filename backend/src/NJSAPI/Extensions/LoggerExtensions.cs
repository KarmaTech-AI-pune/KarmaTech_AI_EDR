using NJSAPI.LoggerFactory;

namespace NJSAPI.Extensions;

public static class LoggerExtensions
{
    public static ILoggerProvider Configure(this ILoggerProviderFactory loggerProviderFactory,
        IEnvironmentProvider environmentProvider)
    {
        if (loggerProviderFactory == null)
        {
            throw new ArgumentNullException(nameof(loggerProviderFactory));
        }

        if (environmentProvider == null)
        {
            throw new ArgumentNullException(nameof(environmentProvider));
        }

        var configPath =
            string.Equals(environmentProvider.AspNetCoreEnvironment, "Development", StringComparison.Ordinal)
                ? "nlog.Development.config"
                : "nlog.config ";
        
        return loggerProviderFactory.Create(configPath);
    }
}