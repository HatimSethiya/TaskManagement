using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TaskManagement.Infrastructure.Identity;

namespace TaskManagement.Infrastructure.Data
{
    public static class IdentitySeeder
    {
        public static async Task SeedAsync(
            IServiceProvider serviceProvider,
            IConfiguration configuration)
        {
            var roleManager =
                serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            var userManager =
                serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            const string adminRole = "Admin";
            const string userRole = "User";

            // Create Admin role if it does not exist
            if (!await roleManager.RoleExistsAsync(adminRole))
            {
                await roleManager.CreateAsync(
                    new IdentityRole(adminRole));
            }

            // Create User role if it does not exist
            if (!await roleManager.RoleExistsAsync(userRole))
            {
                await roleManager.CreateAsync(
                    new IdentityRole(userRole));
            }

            // Read Admin configuration
            var adminEmail =
                configuration["AdminSeed:Email"];

            var adminPassword =
                configuration["AdminSeed:Password"];

            var adminFullName =
                configuration["AdminSeed:FullName"];

            if (string.IsNullOrWhiteSpace(adminEmail) ||
                string.IsNullOrWhiteSpace(adminPassword) ||
                string.IsNullOrWhiteSpace(adminFullName))
            {
                throw new InvalidOperationException(
                    "AdminSeed configuration is missing.");
            }

            // Find Admin account
            var adminUser =
                await userManager.FindByEmailAsync(adminEmail);

            // Create Admin account if it does not exist
            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FullName = adminFullName,
                    EmailConfirmed = true
                };

                var createResult =
                    await userManager.CreateAsync(
                        adminUser,
                        adminPassword);

                if (!createResult.Succeeded)
                {
                    var errors = string.Join(
                        " | ",
                        createResult.Errors.Select(e => e.Description));

                    throw new InvalidOperationException(
                        $"Admin account creation failed: {errors}");
                }
            }

            // Make sure Admin account has Admin role
            if (!await userManager.IsInRoleAsync(
                    adminUser,
                    adminRole))
            {
                var roleResult =
                    await userManager.AddToRoleAsync(
                        adminUser,
                        adminRole);

                if (!roleResult.Succeeded)
                {
                    var errors = string.Join(
                        " | ",
                        roleResult.Errors.Select(e => e.Description));

                    throw new InvalidOperationException(
                        $"Admin role assignment failed: {errors}");
                }
            }
        }
    }
}