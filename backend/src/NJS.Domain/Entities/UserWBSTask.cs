using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Domain.Entities
{
    public class UserWBSTask
    {
        [Key]
        public int Id { get; set; }
        public string UserId { get; set; }
        public User User { get; set; }

        public int WBSTaskId { get; set; }
        public WBSTask WBSTask { get; set; }
    }
}
