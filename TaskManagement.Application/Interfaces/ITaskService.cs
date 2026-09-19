using TaskManagement.Application.DTOs;

namespace TaskManagement.Application.Interfaces
{
    public interface ITaskService
    {
        Task<List<TaskDto>> GetTasksByProjectIdAsync(int projectId);

        Task<TaskDto?> GetByIdAsync(int id);

        Task<TaskDto?> GetDetailsAsync(int id);

        Task<(bool Success, string Error)> CreateAsync(TaskDto model);

        Task<(bool Success, string Error)> UpdateAsync(TaskDto model);

        Task<(bool Success, string Error)> DeleteAsync(int id);

        Task<List<(string UserId, string Email, string FullName)>> GetProjectMembersAsync(int projectId);

        Task<(bool Success, string Error)> AddProjectMemberAsync(int projectId, string userId);

        Task<(bool Success, string Error)> RemoveProjectMemberAsync(int projectId, string userId);
    }
}
