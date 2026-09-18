namespace TaskManagement.Domain.Entities
{
    public class Project
    {
        public int Id { get; set; }

        public string ProjectTitle { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Status { get; set; } = "Planning";

        public string TechStack { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public int MembersCount { get; set; }
    }
}