namespace NJSAPI.Configurations
{
    public record SwaggerSettings
    {
        public string Title { get; init; }
        public string Version { get; init; }
        public string Description { get; init; }
        public Contact Contact { get; init; }
    }
    public record Contact
    {
        public string Name { get; init; }
        public string Email { get; init; }
    }
}
