namespace EDR.API.LoggerFactory;

public class EnvironmentProvider : IEnvironmentProvider
{
    public string AspNetCoreEnvironment => Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
}
