using TaskManagement.Application.DTOs;

namespace TaskManagement.Application.Interfaces
{
    public interface IProjectService
    {
        Task<(bool Success, string Error)> CreateAsync(ProjectDto model);

        Task<List<ProjectDto>> GetAllAsync();

        Task<ProjectDto?> GetByIdAsync(int id);

        Task<ProjectDto?> GetDetailsAsync(int id);

        Task<(bool Success, string Error)> UpdateAsync(ProjectDto model);

        Task<(bool Success, string Error)> DeleteAsync(int id);
    }
}