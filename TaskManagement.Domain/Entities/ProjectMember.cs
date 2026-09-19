using System;

namespace TaskManagement.Domain.Entities
{
    public class ProjectMember
    {
        public int Id { get; set; }

        public int ProjectId { get; set; }

        public string UserId { get; set; } = string.Empty;

        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;

        // Navigation properties are optional to avoid heavy coupling in Domain layer
    }
}
