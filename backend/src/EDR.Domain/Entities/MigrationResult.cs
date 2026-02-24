namespace EDR.Domain.Entities
{
    public class MigrationResult
    {
        public int Id { get; set; } // Added primary key
        public int TenantId { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; }
        public List<MigrationResult> TenantResults { get; set; } = new();
    }
}

