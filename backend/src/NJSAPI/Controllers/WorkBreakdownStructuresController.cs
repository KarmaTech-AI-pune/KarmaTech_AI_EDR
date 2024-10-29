// File: src/NJSAPI/Controllers/WorkBreakdownStructuresController.cs
using Microsoft.AspNetCore.Mvc;
using NJS.Application.Interfaces;
using NJS.Application.Services;
using NJS.Domain.Entities;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/wbs")]
    public class WorkBreakdownStructuresController : ControllerBase
    {
        private readonly IWorkBreakdownStructureRepository _wbsRepository;
        private readonly ProjectManagementService _projectManagementService;

        public WorkBreakdownStructuresController(IWorkBreakdownStructureRepository wbsRepository, ProjectManagementService projectManagementService)
        {
            _wbsRepository = wbsRepository;
            _projectManagementService = projectManagementService;
        }

        [HttpGet("project/{projectId}")]
        public IActionResult GetAllByProjectId(int projectId)
        {
            var wbsList = _wbsRepository.GetAllByProjectId(projectId);
            return Ok(wbsList);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var wbs = _wbsRepository.GetById(id);
            if (wbs == null)
            {
                return NotFound();
            }
            return Ok(wbs);
        }

        [HttpPost]
        public IActionResult Create([FromBody] WorkBreakdownStructure wbs)
        {
            if (wbs == null)
            {
                return BadRequest();
            }
            _projectManagementService.CreateWBS(wbs);
            return CreatedAtAction(nameof(GetById), new { id = wbs.Id }, wbs);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] WorkBreakdownStructure wbs)
        {
            if (wbs == null || id != wbs.Id)
            {
                return BadRequest();
            }
            var existingWbs = _wbsRepository.GetById(id);
            if (existingWbs == null)
            {
                return NotFound();
            }
            _projectManagementService.UpdateWBS(wbs);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var wbs = _wbsRepository.GetById(id);
            if (wbs == null)
            {
                return NotFound();
            }
            _wbsRepository.Delete(id);
            return NoContent();
        }
    }
}