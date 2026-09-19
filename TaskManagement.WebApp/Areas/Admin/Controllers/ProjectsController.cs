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

            // If request is AJAX, return JSON so UI can handle without redirect
            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
            {
                return Json(new { success = true, message = "Project created successfully." });
            }

            return RedirectToAction("Index");
        }

        [HttpGet]
        public async Task<IActionResult> GetById(int id)
        {
            var project = await _projectService.GetByIdAsync(id);

            if (project == null)
                return NotFound();

            return Json(project);
        }

        [HttpGet]
        public async Task<IActionResult> Details(int id)
        {
            var project = await _projectService.GetDetailsAsync(id);

            if (project == null)
                return Json(new { success = false, message = "Project not found." });

            return Json(new { success = true, data = project });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Update(ProjectDto model)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new { success = false, message = string.Join(" | ", errors) });
            }

            var result = await _projectService.UpdateAsync(model);

            if (!result.Success)
            {
                return Json(new { success = false, message = result.Error });
            }

            return Json(new { success = true, message = "Project updated successfully." });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _projectService.DeleteAsync(id);

            if (!result.Success)
            {
                return Json(new { success = false, message = result.Error });
            }

            return Json(new { success = true, message = "Project deleted successfully." });
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var projects = await _projectService.GetAllAsync();

            return View(projects);
        }
    }
}