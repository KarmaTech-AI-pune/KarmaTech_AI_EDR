namespace NJS.Application.Services.IContract
{
    public interface IFeatureAuthorizationService
    {
        bool HasFeatureAccess(string featureName);
        List<string> GetEnabledFeatures();
    }
}
