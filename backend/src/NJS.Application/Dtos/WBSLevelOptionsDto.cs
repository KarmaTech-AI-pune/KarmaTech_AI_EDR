using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    public class WBSLevelOptionsDto
    {
        public List<WBSOptionDto> Level1 { get; set; } = new List<WBSOptionDto>();
        public List<WBSOptionDto> Level2 { get; set; } = new List<WBSOptionDto>();
        public Dictionary<string, List<WBSOptionDto>> Level3 { get; set; } = new Dictionary<string, List<WBSOptionDto>>();
    }

    public class WBSOptionDto
    {
        public int Id { get; set; }
        public string Value { get; set; }
        public string Label { get; set; }
        public int Level { get; set; }
        public string ParentValue { get; set; }
        public int FormType { get; set; }
    }
}
