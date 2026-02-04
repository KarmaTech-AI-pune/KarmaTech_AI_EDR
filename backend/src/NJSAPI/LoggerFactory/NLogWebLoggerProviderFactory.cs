using NLog;
using NLog.Extensions.Logging;

namespace NJSAPI.LoggerFactory;

public class NLogWebLoggerProviderFactory : ILoggerProviderFactory
{
    public ILoggerProvider Create(string configPath)
    {
        LogFactory factory = LogManager.Setup().LoadConfigurationFromFile(configPath, optional: false).LogFactory;
        return new NLogLoggerProvider(null, factory);
    }
}