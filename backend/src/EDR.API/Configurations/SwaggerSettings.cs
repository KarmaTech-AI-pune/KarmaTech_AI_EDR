namespace EDR.API.Configurations
{
    public class SwaggerSettings
    {
        public string Title { get; set; }
        public string Version { get; set; }
        public string Description { get; set; }
        public SwaggerContact Contact { get; set; }
    }

    public class SwaggerContact
    {
        public string Name { get; set; }
        public string Email { get; set; }
    }
}
