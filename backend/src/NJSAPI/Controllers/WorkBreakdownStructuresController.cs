// File: src/NJSAPI/Controllers/WorkBreakdownStructuresController.cs
using MediatR;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;
using NJS.Domain.Entities; // Add this using directive
using NJS.Application.CQRS.WorkBreakdownStructures.Queries; // Add this using directive

namespace NJSAPI.Controllers
{
	[ApiController]
	[Route("api/wbs")]
	public class WorkBreakdownStructuresController : ControllerBase
	{
		private readonly IWorkBreakdownStructureRepository _wbsRepository;
		private readonly object _projectManagementService;

		//private readonly ProjectManagementService _projectManagementService; // Remove this
		private readonly IMediator _mediator;
		private object? projectManagementService;

		public WorkBreakdownStructuresController(IWorkBreakdownStructureRepository wbsRepository, /*ProjectManagementService projectManagementService,*/ IMediator mediator) // Remove ProjectManagementService
		{
			_wbsRepository = wbsRepository;
			_projectManagementService = projectManagementService; // Remove this
			_mediator = mediator;
		}

		[HttpGet("project/{projectId}")]
		public async Task<IActionResult> GetAllByProjectId(int projectId)
		{
			var query = new GetWBSAllByProjectIdQuery { ProjectId = projectId };
			var wbsListDto = await _mediator.Send(query);
			return Ok(wbsListDto);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> GetById(int id)
		{
			var query = new GetWBSByIdQuery { Id = id };
			var wbsDto = await _mediator.Send(query);
			if (wbsDto == null)
			{
				return NotFound();
			}
			return Ok(wbsDto);
		}

		[HttpPost]
		public async Task<IActionResult> Create([FromBody] WBSTaskDto wbsDto)
		{
			if (wbsDto == null)
			{
				return BadRequest();
			}
			var command = new CreateWBSCommand { WbsTaskDto = wbsDto };
			var createdWbsDto = await _mediator.Send(command);
			return CreatedAtAction(nameof(GetById), new { id = createdWbsDto.Id }, createdWbsDto);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, [FromBody] WBSTaskDto wbsDto)
		{
			if (wbsDto == null || id != wbsDto.Id)
			{
				return BadRequest();
			}
			var command = new UpdateWBSCommand { Id = id, WbsDto = wbsDto };
			await _mediator.Send(command);
			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(int id)
		{
			var command = new DeleteWBSCommand { Id = id };
			await _mediator.Send(command);
			return NoContent();
		}
	}
}
