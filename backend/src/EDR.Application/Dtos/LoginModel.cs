//File: backend/src/EDR.Application/Dtos/LoginModel.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EDR.Application.Dtos
{
    public class LoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
        
        public string? Tenant { get; set; }
    }
}

