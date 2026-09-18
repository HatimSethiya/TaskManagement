using TaskManagement.Application.DTOs;

namespace TaskManagement.Application.Interfaces
{
    public interface IProjectService
    {
        Task<(bool Success, string Error)> CreateAsync(ProjectDto model);
    }
}