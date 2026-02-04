namespace NJSAPI.LoggerFactory;

public interface ILoggerProviderFactory
{
    ILoggerProvider Create(string configPath);
}