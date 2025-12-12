using AutoMapper;
using NJS.Application.CQRS.SprintDailyProgresses.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Entities;

namespace NJS.Application
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
