using System;
using System.Collections.Generic;
using System.Text;
using TaskManagement.Application.DTOs;

namespace TaskManagement.Application.Interfaces
{
    public interface IAuthService
    {
        Task<(bool Success, string Error)> RegisterAsync(
            RegisterDto model);

        Task<(bool Success, string Error)> LoginAsync(
            LoginDto model);

        Task LogoutAsync();
    }
}
