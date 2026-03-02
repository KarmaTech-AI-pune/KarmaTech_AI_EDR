using AutoMapper;
using EDR.Application.CQRS.SprintDailyProgresses.Commands;
using EDR.Application.Dtos;
using EDR.Domain.Entities;

namespace EDR.Application
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<CreateSprintDailyProgressCommand, SprintDailyProgress>();
            CreateMap<UpdateSprintDailyProgressCommand, SprintDailyProgress>(); // Added for update command
            CreateMap<SprintDailyProgress, SprintDailyProgressDto>();
        }
    }
}

