using EDR.API.LoggerFactory;

namespace EDR.API.Extensions;

public static class LoggerWebConfiguration
{
    public static ILoggerProvider Configure()
    {
        IEnvironmentProvider environmentProvider = new EnvironmentProvider();
        ILoggerProviderFactory loggerProviderFactory = new NLogWebLoggerProviderFactory();
        return loggerProviderFactory.Configure(environmentProvider);
    }
}
