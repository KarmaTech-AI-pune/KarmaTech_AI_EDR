namespace NJS.Application.Services
{
    public interface ICurrentUserService
    {
        string GetCurrentUserId();
        string GetCurrentUserName();
    }
}
