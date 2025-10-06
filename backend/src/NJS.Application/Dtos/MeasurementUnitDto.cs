namespace NJS.Application.DTOs
{
using NJS.Domain.Entities;

    public class MeasurementUnitDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public FormType FormType { get; set; }
    }
}
