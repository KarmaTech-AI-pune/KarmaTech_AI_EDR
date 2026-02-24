namespace EDR.API.LoggerFactory;

public interface ILoggerProviderFactory
{
    ILoggerProvider Create(string configPath);
}
