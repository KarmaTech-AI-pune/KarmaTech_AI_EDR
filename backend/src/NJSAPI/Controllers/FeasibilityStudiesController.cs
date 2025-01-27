using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/feasibilitystudy")]
    [Authorize]
    public class FeasibilityStudiesController : ControllerBase
    {
        private readonly IFeasibilityStudyRepository _feasibilityStudyRepository;

        public FeasibilityStudiesController(IFeasibilityStudyRepository feasibilityStudyRepository)
        {
            _feasibilityStudyRepository = feasibilityStudyRepository;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,ProjectManager")]
        public IActionResult GetAll()
        {
            var studies = _feasibilityStudyRepository.GetAll();
            return Ok(studies);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,ProjectManager")]
        public IActionResult GetById(int id)
        {
            var study = _feasibilityStudyRepository.GetById(id);
            if (study == null)
            {
                return NotFound();
            }
            return Ok(study);
        }

        [HttpGet("project/{projectId}")]
        [Authorize(Roles = "Admin,ProjectManager")]
        public IActionResult GetByProjectId(int projectId)
        {
            var study = _feasibilityStudyRepository.GetByProjectId(projectId);
            if (study == null)
            {
                return NotFound();
            }
            return Ok(study);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,ProjectManager")]
        public IActionResult Create([FromBody] FeasibilityStudy study)
        {
            if (study == null)
            {
                return BadRequest();
            }

            try
            {
                _feasibilityStudyRepository.Add(study);
                return CreatedAtAction(nameof(GetById), new { id = study.Id }, study);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,ProjectManager")]
        public IActionResult Update(int id, [FromBody] FeasibilityStudy study)
        {
            if (study == null || id != study.Id)
            {
                return BadRequest();
            }

            var existingStudy = _feasibilityStudyRepository.GetById(id);
            if (existingStudy == null)
            {
                return NotFound();
            }

            try
            {
                _feasibilityStudyRepository.Update(study);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
