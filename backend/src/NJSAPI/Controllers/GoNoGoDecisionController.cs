using Microsoft.AspNetCore.Mvc;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GoNoGoDecisionController : ControllerBase
    {
        private readonly IGoNoGoDecisionRepository _repository;

        public GoNoGoDecisionController(IGoNoGoDecisionRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public ActionResult<IEnumerable<GoNoGoDecision>> GetAll()
        {
            try
            {
                var decisions = _repository.GetAll();
                return Ok(decisions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public ActionResult<GoNoGoDecision> GetById(int id)
        {
            try
            {
                var decision = _repository.GetById(id);
                if (decision == null)
                    return NotFound($"GoNoGoDecision with ID {id} not found");

                return Ok(decision);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("project/{projectId}")]
        public ActionResult<GoNoGoDecision> GetByProjectId(int projectId)
        {
            try
            {
                var decision = _repository.GetByProjectId(projectId);
                if (decision == null)
                    return NotFound($"GoNoGoDecision for project ID {projectId} not found");

                return Ok(decision);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public ActionResult<GoNoGoDecision> Create([FromBody] GoNoGoDecision decision)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                _repository.Add(decision);
                return CreatedAtAction(nameof(GetById), new { id = decision.Id }, decision);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] GoNoGoDecision decision)
        {
            try
            {
                if (id != decision.Id)
                    return BadRequest("ID mismatch");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var existingDecision = _repository.GetById(id);
                if (existingDecision == null)
                    return NotFound($"GoNoGoDecision with ID {id} not found");

                _repository.Update(decision);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                var decision = _repository.GetById(id);
                if (decision == null)
                    return NotFound($"GoNoGoDecision with ID {id} not found");

                _repository.Delete(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
