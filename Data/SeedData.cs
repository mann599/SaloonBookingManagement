using Microsoft.EntityFrameworkCore;
using SaloonBookingManagement.Entities;

namespace SaloonBookingManagement.Data;

public static class SeedData
{
    public static async Task InitializeAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        if (await db.Categories.AnyAsync(cancellationToken))
            return;

        var hair = new Category { Name = "Hair" };
        var spa = new Category { Name = "Spa" };
        db.Categories.AddRange(hair, spa);
        await db.SaveChangesAsync(cancellationToken);

        db.Services.AddRange(
            new Service { CategoryId = hair.Id, Name = "Haircut", Price = 25.00m, Duration = 30 },
            new Service { CategoryId = hair.Id, Name = "Hair Color", Price = 75.00m, Duration = 90 },
            new Service { CategoryId = hair.Id, Name = "Styling", Price = 35.00m, Duration = 45 },
            new Service { CategoryId = spa.Id, Name = "Facial", Price = 50.00m, Duration = 60 },
            new Service { CategoryId = spa.Id, Name = "Massage", Price = 80.00m, Duration = 60 }
        );
        await db.SaveChangesAsync(cancellationToken);

        db.Users.AddRange(
            new User
            {
                Name = "Provider User",
                Email = "provider@saloon.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Provider123"),
                Role = UserRole.Provider
            },
            new User
            {
                Name = "Customer User",
                Email = "customer@saloon.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer123"),
                Role = UserRole.Customer
            }
        );
        await db.SaveChangesAsync(cancellationToken);
    }
}
