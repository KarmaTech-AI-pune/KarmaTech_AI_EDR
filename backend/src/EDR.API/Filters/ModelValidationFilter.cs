using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq;

namespace EDR.API.Filters
{
    /// <summary>
    /// Action filter to validate model state and return proper error responses
    /// </summary>
    public class ModelValidationFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.ModelState.IsValid)
            {
                var errors = context.ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? new string[0]
                    );

                var response = new
                {
                    Success = false,
                    Message = "Model validation failed",
                    Errors = errors,
                    StatusCode = 400,
                    Timestamp = DateTime.UtcNow
                };

                context.Result = new BadRequestObjectResult(response);
            }

            base.OnActionExecuting(context);
        }
    }
}
