using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using EDR.Application.Services.IContract;

namespace EDR.API.Attributes
{
    /// <summary>
    /// Authorization attribute to restrict access to features based on tenant subscription plan
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
    public class RequireFeatureAttribute : Attribute, IAuthorizationFilter
    {
        public string FeatureName { get; }

        public RequireFeatureAttribute(string featureName)
        {
            FeatureName = featureName;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var featureService = context.HttpContext.RequestServices
                .GetRequiredService<IFeatureAuthorizationService>();

            if (!featureService.HasFeatureAccess(FeatureName))
            {
                context.Result = new ObjectResult(new
                {
                    error = "Feature not available",
                    message = $"Your subscription plan does not include the '{FeatureName}' feature.",
                    requiredFeature = FeatureName
                })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
            }
        }
    }
}

