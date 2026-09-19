using System;

namespace TaskManagement.Domain.Entities
{
    public class TaskItem
    {
        public int Id { get; set; }

        public int ProjectId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Scenario { get; set; } = string.Empty;

        public string AssignedToUserId { get; set; } = string.Empty;

        public string Priority { get; set; } = "Low";

        public string Status { get; set; } = "Pending";

        public DateTime StartDate { get; set; }

        public DateTime ExpectedEndDate { get; set; }

        public decimal Amount { get; set; }
    }
}
