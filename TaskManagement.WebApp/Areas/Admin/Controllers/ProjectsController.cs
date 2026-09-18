using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.WebApp.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = "Admin")]
    public class ProjectsController : Controller
    {
        private readonly IProjectService _projectService;

        public ProjectsController(
            IProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(
            ProjectDto model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var result =
                await _projectService.CreateAsync(model);

            if (!result.Success)
            {
                ModelState.AddModelError(
                    string.Empty,
                    result.Error);

                return View(model);
            }

            return RedirectToAction("Index");
        }

        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }
    }
}