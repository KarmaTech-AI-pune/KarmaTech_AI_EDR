// File: backend/src/controllers/ProjectController.cs
// Purpose: Controller for handling project-related requests
using Microsoft.AspNetCore.Mvc;
using NJSAPI.Interfaces;
using NJSAPI.Models;
using NJSAPI.Services;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/project")]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectRepository _projectRepository;
        private readonly ProjectManagementService _projectManagementService;

        public ProjectsController(IProjectRepository projectRepository, ProjectManagementService projectManagementService)
        {
            _projectRepository = projectRepository;
            _projectManagementService = projectManagementService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var projects = _projectRepository.GetAll();
            return Ok(projects);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var project = _projectRepository.GetById(id);
            if (project == null)
            {
                return NotFound();
            }
            return Ok(project);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Project project)
        {
            if (project == null)
            {
                return BadRequest();
            }

            _projectRepository.Add(project);
            return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Project project)
        {
            if (project == null || id != project.Id)
            {
                return BadRequest();
            }
            var existingProject = _projectRepository.GetById(id);
            if (existingProject == null)
            {
                return NotFound();
            }

            _projectRepository.Update(project);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var project = _projectRepository.GetById(id);
            if (project == null)
            {
                return NotFound();
            }
            _projectRepository.Delete(id);
            return NoContent();
        }

        [HttpPost("{id}/feasibility-study")]
        public IActionResult CreateFeasibilityStudy(int id, [FromBody] FeasibilityStudy feasibilityStudy)
        {
            var project = _projectRepository.GetById(id);
            if (project == null)
            {
                return NotFound();
            }
            feasibilityStudy.ProjectId = id;
            _projectManagementService.CreateFeasibilityStudy(feasibilityStudy);
            return CreatedAtAction(nameof(GetFeasibilityStudy), new { id = project.Id }, feasibilityStudy);
        }

        [HttpGet("{id}/feasibility-study")]
        public IActionResult GetFeasibilityStudy(int id)
        {
            var feasibilityStudy = _projectManagementService.GetFeasibilityStudy(id);
            if (feasibilityStudy == null)
            {
                return NotFound();
            }
            return Ok(feasibilityStudy);
        }

        [HttpPut("{id}/feasibility-study")]
        public IActionResult UpdateFeasibilityStudy(int id, [FromBody] FeasibilityStudy feasibilityStudy)
        {
            var project = _projectRepository.GetById(id);
            if (project == null)
            {
                return NotFound();
            }
            feasibilityStudy.ProjectId = id;
            _projectManagementService.UpdateFeasibilityStudy(feasibilityStudy);
            return NoContent();
        }

        [HttpPost("{id}/go-no-go")]
        public IActionResult SubmitGoNoGoDecision(int id, [FromBody] GoNoGoDecision decision)
        {
            var project = _projectRepository.GetById(id);
            if (project == null)
            {
                return NotFound();
            }
            decision.ProjectId = id;
            _projectManagementService.SubmitGoNoGoDecision(decision);
            return CreatedAtAction(nameof(GetGoNoGoDecision), new { id = project.Id }, decision);
        }

        [HttpGet("{id}/go-no-go")]
        public IActionResult GetGoNoGoDecision(int id)
        {
            var decision = _projectManagementService.GetGoNoGoDecision(id);
            if (decision == null)
            {
                return NotFound();
            }
            return Ok(decision);
        }
    }
}