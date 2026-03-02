namespace EDR.API.LoggerFactory;

public interface IEnvironmentProvider
{
    string? AspNetCoreEnvironment { get; }
}
