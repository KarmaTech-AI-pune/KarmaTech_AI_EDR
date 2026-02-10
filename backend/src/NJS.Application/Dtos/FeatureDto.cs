namespace NJS.Application.DTOs
{
    public class FeatureDto
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
