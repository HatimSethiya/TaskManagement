using System.ComponentModel.DataAnnotations;

namespace TaskManagement.Application.DTOs
{
    public class ProjectDto
    {
        public int Id { get; set; }
        [Required]
        public string ProjectTitle { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public string Status { get; set; } = "Planning";

        [Required]
        public string TechStack { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Range(1, 100)]
        public int MembersCount { get; set; }
    }
}