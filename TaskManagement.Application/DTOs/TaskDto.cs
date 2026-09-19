using System;
using System.ComponentModel.DataAnnotations;

namespace TaskManagement.Application.DTOs
{
    public class TaskDto
    {
        public int Id { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        public string Scenario { get; set; } = string.Empty;

        [Required]
        public string AssignedToUserId { get; set; } = string.Empty;

        [Required]
        public string Priority { get; set; } = "Low";

        [Required]
        public string Status { get; set; } = "Pending";

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime ExpectedEndDate { get; set; }

        [Required]
        [Range(0, 9999999999.99)]
        public decimal Amount { get; set; }
    }
}
