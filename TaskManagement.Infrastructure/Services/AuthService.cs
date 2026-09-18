//using System;
//using System.Collections.Generic;
//using System.Text;
using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;
using TaskManagement.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace TaskManagement.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        public async Task<(bool Success, string Error)> RegisterAsync(
            RegisterDto model)
        {
            var existingUser =
                await _userManager.FindByEmailAsync(model.Email);

            if (existingUser != null)
            {
                return (false, "Email already exists.");
            }

            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                FullName = model.FullName
            };

            var result = await _userManager.CreateAsync(
                user,
                model.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(
                    " ",
                    result.Errors.Select(x => x.Description));

                return (false, errors);
            }

            var roleResult =
                await _userManager.AddToRoleAsync(
                    user,
                    "User");

            if (!roleResult.Succeeded)
            {
                var errors = string.Join(
                    " ",
                    roleResult.Errors.Select(x => x.Description));

                return (false, errors);
            }

            return (true, string.Empty);
        }

        public async Task<(bool Success, string Error)> LoginAsync(
            LoginDto model)
        {
            var user =
                await _userManager.FindByEmailAsync(model.Email);

            if (user == null)
            {
                return (false, "Invalid email or password.");
            }

            var result =
                await _signInManager.PasswordSignInAsync(
                    user,
                    model.Password,
                    model.RememberMe,
                    lockoutOnFailure: true);

            if (result.Succeeded)
            {
                return (true, string.Empty);
            }

            if (result.IsLockedOut)
            {
                return (
                    false,
                    "Your account is temporarily locked.");
            }

            if (result.IsNotAllowed)
            {
                return (
                    false,
                    "Login is not allowed for this account.");
            }

            return (false, "Invalid email or password.");
        }

        public async Task LogoutAsync()
        {
            await _signInManager.SignOutAsync();
        }
    }
}