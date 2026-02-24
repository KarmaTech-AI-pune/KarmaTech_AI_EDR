namespace EDR.Application.Dtos
{
    public class EmployeeDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public int RoleId { get; set; }
        public decimal StandardRate { get; set; }
        public bool IsConsultant { get; set; }
        public bool IsActive { get; set; }
    }
}

