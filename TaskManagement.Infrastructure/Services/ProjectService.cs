using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

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

        public async Task<List<ProjectDto>> GetAllAsync()
        {
            return await _db.Projects
                .AsNoTracking()
                .OrderByDescending(x => x.Id)
                .Select(x => new ProjectDto
                {
                    Id = x.Id,
                    ProjectTitle = x.ProjectTitle,
                    Description = x.Description,
                    Status = x.Status,
                    TechStack = x.TechStack,
                    StartDate = x.StartDate,
                    EndDate = x.EndDate,
                    MembersCount = x.MembersCount
                })
                .ToListAsync();
        }

        public async Task<ProjectDto?> GetByIdAsync(int id)
        {
            var project = await _db.Projects
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (project == null) return null;

            return new ProjectDto
            {
                Id = project.Id,
                ProjectTitle = project.ProjectTitle,
                Description = project.Description,
                Status = project.Status,
                TechStack = project.TechStack,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                MembersCount = project.MembersCount
            };
        }

        public async Task<ProjectDto?> GetDetailsAsync(int id)
        {
            // For now details are the same as the DTO representation
            return await GetByIdAsync(id);
        }

        public async Task<(bool Success, string Error)> UpdateAsync(ProjectDto model)
        {
            if (model.StartDate > model.EndDate)
            {
                return (false, "Start date cannot be greater than end date.");
            }

            var project = await _db.Projects.FirstOrDefaultAsync(x => x.Id == model.Id);

            if (project == null)
            {
                return (false, "Project not found.");
            }

            project.ProjectTitle = model.ProjectTitle;
            project.Description = model.Description;
            project.Status = model.Status;
            project.TechStack = model.TechStack;
            project.StartDate = model.StartDate;
            project.EndDate = model.EndDate;
            project.MembersCount = model.MembersCount;

            await _db.SaveChangesAsync();

            return (true, string.Empty);
        }

        public async Task<(bool Success, string Error)> DeleteAsync(int id)
        {
            var project = await _db.Projects.FirstOrDefaultAsync(x => x.Id == id);

            if (project == null)
            {
                return (false, "Project not found.");
            }

            _db.Projects.Remove(project);

            await _db.SaveChangesAsync();

            return (true, string.Empty);
        }
    }
}