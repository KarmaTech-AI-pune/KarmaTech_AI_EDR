namespace EDR.Application.Dtos
{
    public class WBSDetailsDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public List<WBSTaskDto> Tasks { get; set; } = new();
    }

    public class WBSTaskHierarchyDto : WBSTaskDto
    {
    }
}

