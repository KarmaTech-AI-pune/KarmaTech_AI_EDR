using AutoMapper;
using NJS.Domain.Entities;
using NJS.Application.Dtos;

namespace NJS.Application.Mapping
{
    public class OpportunityTrackingMappingProfile : Profile
    {
        public OpportunityTrackingMappingProfile()
        {
            CreateMap<OpportunityTracking, OpportunityTrackingDto>()
                .ForMember(dest => dest.CurrentHistory, opt => opt.MapFrom(src => src.OpportunityHistories))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt))
                .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedBy))
                .ForMember(dest => dest.UpdatedBy, opt => opt.MapFrom(src => src.UpdatedBy));

            CreateMap<OpportunityHistory, OpportunityHistoryDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status));
        }
    }
}
