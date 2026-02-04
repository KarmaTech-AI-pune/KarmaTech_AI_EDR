namespace NJSAPI.LoggerFactory;

public interface IEnvironmentProvider
{
    string? AspNetCoreEnvironment { get; }
}