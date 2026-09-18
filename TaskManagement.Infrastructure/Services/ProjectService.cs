using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Services
{
    public class ProjectService : IProjectService
    {
        private readonly ApplicationDbContext _db;

        public ProjectService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<(bool Success, string Error)> CreateAsync(
            ProjectDto model)
        {
            if (model.StartDate > model.EndDate)
            {
                return (
                    false,
                    "Start date cannot be greater than end date."
                );
            }

            var project = new Project
            {
                ProjectTitle = model.ProjectTitle,
                Description = model.Description,
                Status = model.Status,
                TechStack = model.TechStack,
                StartDate = model.StartDate,
                EndDate = model.EndDate,
                MembersCount = model.MembersCount
            };

            _db.Projects.Add(project);

            await _db.SaveChangesAsync();

            return (true, string.Empty);
        }
    }
}