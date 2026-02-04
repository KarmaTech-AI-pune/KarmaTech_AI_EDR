using NJS.Domain.Entities;

namespace NJS.Application.DTOs
{


    public class MeasurementUnitDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public FormType FormType { get; set; }
    }
}
