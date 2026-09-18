using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Identity;

namespace TaskManagement.Infrastructure.Identity
{
    public class ApplicationUser : IdentityUser 
    {
        public string? FullName { get; set; }
    }
}
