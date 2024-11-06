// File: backend/src/NJSAPI/Controllers/FeasibilityStudiesController.cs
namespace NJSAPI.Controllers
{
    /*
    [ApiController]
    [Route("api/feasibilitystudy")]
    public class FeasibilityStudiesController : ControllerBase
    {
        private readonly IFeasibilityStudyRepository _feasibilityStudyRepository;

        public FeasibilityStudiesController(IFeasibilityStudyRepository feasibilityStudyRepository)
        {
            _feasibilityStudyRepository = feasibilityStudyRepository;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var studies = _feasibilityStudyRepository.GetAll();
            return Ok(studies);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var study = _feasibilityStudyRepository.GetById(id);
            if (study == null)
            {
                return NotFound();
            }
            return Ok(study);
        }

        [HttpPost]
        public IActionResult Create([FromBody] FeasibilityStudy study)
        {
            if (study == null)
            {
                return BadRequest();
            }
            _feasibilityStudyRepository.Add(study);
            return CreatedAtAction(nameof(GetById), new { id = study.Id }, study);
        }

        [HttpPut("{id}")]
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
            _feasibilityStudyRepository.Update(study);
            return NoContent();
        }
    }*/
}
