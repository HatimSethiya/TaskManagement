using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Infrastructure.Data;
using TaskManagement.Infrastructure.Identity;

namespace TaskManagement.Infrastructure.Services
{
    public class TaskService : ITaskService
    {
        private readonly ApplicationDbContext _db;

        private static readonly string[] AllowedPriorities = new[] { "Low", "Medium", "High", "Critical" };

        private static readonly string[] AllowedStatuses = new[] { "Pending", "In Progress", "Completed", "On Hold", "Cancelled" };

        public TaskService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<List<TaskDto>> GetTasksByProjectIdAsync(int projectId)
        {
            return await _db.TaskItems
                .AsNoTracking()
                .Where(t => t.ProjectId == projectId)
                .OrderByDescending(t => t.Id)
                .Select(t => new TaskDto
                {
                    Id = t.Id,
                    ProjectId = t.ProjectId,
                    Title = t.Title,
                    Scenario = t.Scenario,
                    AssignedToUserId = t.AssignedToUserId,
                    Priority = t.Priority,
                    Status = t.Status,
                    StartDate = t.StartDate,
                    ExpectedEndDate = t.ExpectedEndDate,
                    Amount = t.Amount
                })
                .ToListAsync();
        }

        public async Task<TaskDto?> GetByIdAsync(int id)
        {
            var t = await _db.TaskItems.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (t == null) return null;
            return new TaskDto
            {
                Id = t.Id,
                ProjectId = t.ProjectId,
                Title = t.Title,
                Scenario = t.Scenario,
                AssignedToUserId = t.AssignedToUserId,
                Priority = t.Priority,
                Status = t.Status,
                StartDate = t.StartDate,
                ExpectedEndDate = t.ExpectedEndDate,
                Amount = t.Amount
            };
        }

        public async Task<TaskDto?> GetDetailsAsync(int id)
        {
            return await GetByIdAsync(id);
        }

        public async Task<(bool Success, string Error)> CreateAsync(TaskDto model)
        {
            // Basic validation
            var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == model.ProjectId);
            if (project == null)
                return (false, "Project not found.");

            if (!AllowedPriorities.Contains(model.Priority))
                return (false, "Invalid priority.");

            if (!AllowedStatuses.Contains(model.Status))
                return (false, "Invalid status.");

            if (model.StartDate > model.ExpectedEndDate)
                return (false, "Task start date cannot be after expected end date.");

            if (model.StartDate < project.StartDate)
                return (false, "Task start date cannot be before project start date.");

            if (model.ExpectedEndDate > project.EndDate)
                return (false, "Task expected end date cannot be after project end date.");

            // Assigned user must be a project member
            var isMember = await _db.ProjectMembers.AnyAsync(pm => pm.ProjectId == model.ProjectId && pm.UserId == model.AssignedToUserId);
            if (!isMember)
                return (false, "Assigned user is not a member of the project.");

            var task = new TaskItem
            {
                ProjectId = model.ProjectId,
                Title = model.Title,
                Scenario = model.Scenario,
                AssignedToUserId = model.AssignedToUserId,
                Priority = model.Priority,
                Status = model.Status,
                StartDate = model.StartDate,
                ExpectedEndDate = model.ExpectedEndDate,
                Amount = model.Amount
            };

            _db.TaskItems.Add(task);
            await _db.SaveChangesAsync();

            return (true, string.Empty);
        }

        public async Task<(bool Success, string Error)> UpdateAsync(TaskDto model)
        {
            var task = await _db.TaskItems.FirstOrDefaultAsync(t => t.Id == model.Id);
            if (task == null) return (false, "Task not found.");

            // Ensure task belongs to the project specified
            if (task.ProjectId != model.ProjectId) return (false, "Task does not belong to the specified project.");

            var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == model.ProjectId);
            if (project == null) return (false, "Project not found.");

            if (!AllowedPriorities.Contains(model.Priority))
                return (false, "Invalid priority.");

            if (!AllowedStatuses.Contains(model.Status))
                return (false, "Invalid status.");

            if (model.StartDate > model.ExpectedEndDate)
                return (false, "Task start date cannot be after expected end date.");

            if (model.StartDate < project.StartDate)
                return (false, "Task start date cannot be before project start date.");

            if (model.ExpectedEndDate > project.EndDate)
                return (false, "Task expected end date cannot be after project end date.");

            var isMember = await _db.ProjectMembers.AnyAsync(pm => pm.ProjectId == model.ProjectId && pm.UserId == model.AssignedToUserId);
            if (!isMember) return (false, "Assigned user is not a member of the project.");

            task.Title = model.Title;
            task.Scenario = model.Scenario;
            task.AssignedToUserId = model.AssignedToUserId;
            task.Priority = model.Priority;
            task.Status = model.Status;
            task.StartDate = model.StartDate;
            task.ExpectedEndDate = model.ExpectedEndDate;
            task.Amount = model.Amount;

            await _db.SaveChangesAsync();

            return (true, string.Empty);
        }

        public async Task<(bool Success, string Error)> DeleteAsync(int id)
        {
            var task = await _db.TaskItems.FirstOrDefaultAsync(t => t.Id == id);
            if (task == null) return (false, "Task not found.");

            _db.TaskItems.Remove(task);
            await _db.SaveChangesAsync();

            return (true, string.Empty);
        }

        public async Task<List<(string UserId, string Email, string FullName)>> GetProjectMembersAsync(int projectId)
        {
            // Join project members with users to return basic info
            var members = await (from pm in _db.ProjectMembers
                                 join u in _db.Users on pm.UserId equals u.Id
                                 where pm.ProjectId == projectId
                                 select new { u.Id, u.Email, u.FullName })
                                .AsNoTracking()
                                .ToListAsync();

            return members.Select(m => (m.Id, m.Email, m.FullName)).ToList();
        }

        public async Task<(bool Success, string Error)> AddProjectMemberAsync(int projectId, string userId)
        {
            var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == projectId);
            if (project == null) return (false, "Project not found.");

            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return (false, "User not found.");

            var exists = await _db.ProjectMembers.AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
            if (exists) return (false, "User is already a member of this project.");

            var count = await _db.ProjectMembers.CountAsync(pm => pm.ProjectId == projectId);
            if (count >= project.MembersCount) return (false, "Project members limit reached.");

            _db.ProjectMembers.Add(new ProjectMember { ProjectId = projectId, UserId = userId, AssignedDate = DateTime.UtcNow });
            await _db.SaveChangesAsync();

            return (true, string.Empty);
        }

        public async Task<(bool Success, string Error)> RemoveProjectMemberAsync(int projectId, string userId)
        {
            var pm = await _db.ProjectMembers.FirstOrDefaultAsync(p => p.ProjectId == projectId && p.UserId == userId);
            if (pm == null) return (false, "Project member not found.");

            _db.ProjectMembers.Remove(pm);
            await _db.SaveChangesAsync();

            return (true, string.Empty);
        }
    }
}
