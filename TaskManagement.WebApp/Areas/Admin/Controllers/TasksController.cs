using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.WebApp.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = "Admin")]
    public class TasksController : Controller
    {
        private readonly ITaskService _taskService;

        public TasksController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        // GET: /Admin/Tasks/Project/{projectId}
        [HttpGet]
        public async Task<IActionResult> Project(int projectId)
        {
            // Verify project exists by attempting to get tasks (service will validate existence in Create but here we check quickly)
            var tasks = await _taskService.GetTasksByProjectIdAsync(projectId);

            // If project does not exist, service would return empty list; check project existence via members retrieval
            var members = await _taskService.GetProjectMembersAsync(projectId);
            if (tasks == null && (members == null || !members.Any()))
            {
                return NotFound();
            }

            ViewBag.ProjectId = projectId;
            return View("ProjectTasks", tasks);
        }

        [HttpGet]
        public async Task<IActionResult> Get(int id)
        {
            var task = await _taskService.GetByIdAsync(id);
            if (task == null) return NotFound();
            return Json(task);
        }

        [HttpGet]
        public async Task<IActionResult> Details(int id)
        {
            var task = await _taskService.GetDetailsAsync(id);
            if (task == null) return Json(new { success = false, message = "Task not found." });
            return Json(new { success = true, data = task });
        }

        [HttpGet]
        public async Task<IActionResult> Members(int projectId)
        {
            var members = await _taskService.GetProjectMembersAsync(projectId);
            return Json(new { success = true, data = members });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(TaskDto model)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new { success = false, message = string.Join(" | ", errors) });
            }

            var result = await _taskService.CreateAsync(model);
            if (!result.Success) return Json(new { success = false, message = result.Error });
            return Json(new { success = true, message = "Task created successfully." });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Update(TaskDto model)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new { success = false, message = string.Join(" | ", errors) });
            }

            var result = await _taskService.UpdateAsync(model);
            if (!result.Success) return Json(new { success = false, message = result.Error });
            return Json(new { success = true, message = "Task updated successfully." });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id, int projectId)
        {
            // Ensure the task belongs to the project (service checks ownership in Update/Delete)
            var task = await _taskService.GetByIdAsync(id);
            if (task == null) return Json(new { success = false, message = "Task not found." });
            if (task.ProjectId != projectId) return Json(new { success = false, message = "Cross-project operation is not allowed." });

            var result = await _taskService.DeleteAsync(id);
            if (!result.Success) return Json(new { success = false, message = result.Error });
            return Json(new { success = true, message = "Task deleted successfully." });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AddMember(int projectId, string userId)
        {
            var result = await _taskService.AddProjectMemberAsync(projectId, userId);
            if (!result.Success) return Json(new { success = false, message = result.Error });
            return Json(new { success = true, message = "Member added successfully." });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RemoveMember(int projectId, string userId)
        {
            var result = await _taskService.RemoveProjectMemberAsync(projectId, userId);
            if (!result.Success) return Json(new { success = false, message = result.Error });
            return Json(new { success = true, message = "Member removed successfully." });
        }
    }
}
