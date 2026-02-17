using Microsoft.AspNetCore.Http;
using EDR.Application.Services.IContract;

namespace EDR.Application.Services{
    public class FeatureAuthorizationService : IFeatureAuthorizationService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public FeatureAuthorizationService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public bool HasFeatureAccess(string featureName)
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user == null || !user.Identity.IsAuthenticated)
                return false;

            // Check if super admin (has access to all features)
            var isSuperAdmin = user.FindFirst("IsSuperAdmin")?.Value == "true";
            if (isSuperAdmin)
                return true;

            // Get features from JWT claims
            var featuresClaim = user.FindFirst("Features")?.Value;
            if (string.IsNullOrEmpty(featuresClaim))
                return false;

            // Check for wildcard (super admin)
            if (featuresClaim == "*")
                return true;

            // Check if feature is in the comma-separated list
            var enabledFeatures = featuresClaim.Split(',', StringSplitOptions.RemoveEmptyEntries);
            return enabledFeatures.Contains(featureName, StringComparer.OrdinalIgnoreCase);
        }

        public List<string> GetEnabledFeatures()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user == null || !user.Identity.IsAuthenticated)
                return new List<string>();

            var featuresClaim = user.FindFirst("Features")?.Value;
            if (string.IsNullOrEmpty(featuresClaim))
                return new List<string>();

            if (featuresClaim == "*")
            {
                // Return wildcard for super admin
                return new List<string> { "*" };
            }

            return featuresClaim.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
        }
    }
}


