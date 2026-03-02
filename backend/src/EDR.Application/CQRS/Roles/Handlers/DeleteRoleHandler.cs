using MediatR;
using Microsoft.AspNetCore.Identity;
using EDR.Application.CQRS.Roles.Commands;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Roles.Handlers
{
    public class DeleteRoleHandler : IRequestHandler<DeleteRoleCommand, bool>
    {
        private readonly ProjectManagementContext _context;
        private readonly RoleManager<Role> _roleManager;

        public DeleteRoleHandler(ProjectManagementContext context, RoleManager<Role> roleManager)
        {
            _context = context;
            _roleManager = roleManager;
        }

        public async Task<bool> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var existingPermissions = _context.Set<RolePermission>().Where(rp => rp.RoleId == request.Id);
                _context.Set<RolePermission>().RemoveRange(existingPermissions);
                var role = await _roleManager.FindByIdAsync(request.Id);
                await _roleManager.DeleteAsync(role);
                return true;
            }
            catch
            {
                throw;
            }

        }
    }
}

