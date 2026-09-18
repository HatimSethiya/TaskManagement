using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;
using Microsoft.AspNetCore.Identity;
using TaskManagement.Infrastructure.Identity;

namespace TaskManagement.Web.Controllers
{
    public class AccountController : Controller
    {
        private readonly IAuthService _authService;
        private readonly UserManager<ApplicationUser> _userManager;

        public AccountController(
                IAuthService authService,
                UserManager<ApplicationUser> userManager)
        {
            _authService = authService;
            _userManager = userManager;
        }

        // GET: /Account/Login
        [HttpGet]
        public IActionResult Login(string? returnUrl = null)
        {
            ViewBag.ReturnUrl = returnUrl;

            return View();
        }

        // POST: /Account/Login
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(
            [FromBody] LoginDto model,
            string? returnUrl = null)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(new
                {
                    success = false,
                    message = "Please enter valid login details.",
                    errors
                });
            }

            var result = await _authService.LoginAsync(model);

            if (!result.Success)
            {
                return BadRequest(new
                {
                    success = false,
                    message = result.Error
                });
            }

            var user =
                 await _userManager.FindByEmailAsync(model.Email);

            var redirectUrl = "/Home/Index";

            if (user != null &&
                await _userManager.IsInRoleAsync(user, "Admin"))
            {
                redirectUrl = "/Admin/Dashboard";
            }
            else if (!string.IsNullOrEmpty(returnUrl)
                     && Url.IsLocalUrl(returnUrl))
            {
                redirectUrl = returnUrl;
            }

            return Ok(new
            {
                success = true,
                message = "Login successful.",
                redirectUrl
            });

        }

            // GET: /Account/Register
            [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        // POST: /Account/Register
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(
            [FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(new
                {
                    success = false,
                    message = "Please correct the form.",
                    errors
                });
            }

            var result =
                await _authService.RegisterAsync(model);

            if (!result.Success)
            {
                return BadRequest(new
                {
                    success = false,
                    message = result.Error
                });
            }

            return Ok(new
            {
                success = true,
                message = "Registration successful.",
                redirectUrl = "/Account/Login"
            });
        }

        // POST: /Account/Logout
        [Authorize]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await _authService.LogoutAsync();

            return RedirectToAction(
                 "Login",
                 "Account");
        }

        // GET: /Account/AccessDenied
        [HttpGet]
        public IActionResult AccessDenied()
        {
            return View();
        }
    }
}