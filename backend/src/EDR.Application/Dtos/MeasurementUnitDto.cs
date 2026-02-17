using EDR.Domain.Entities;

namespace EDR.Application.DTOs
{


    public class MeasurementUnitDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public FormType FormType { get; set; }
    }
}

