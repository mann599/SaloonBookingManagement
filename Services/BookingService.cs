using Microsoft.EntityFrameworkCore;
using SaloonBookingManagement.Data;
using SaloonBookingManagement.DTOs;
using SaloonBookingManagement.Entities;

namespace SaloonBookingManagement.Services;

public class BookingService : IBookingService
{
    private readonly AppDbContext _db;

    public BookingService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<BookingResponse>> GetMyBookingsAsync(int userId, BookingStatus? status, CancellationToken cancellationToken = default)
    {
        var query = _db.Bookings
            .Where(b => b.UserId == userId);

        if (status.HasValue)
            query = query.Where(b => b.Status == status.Value);

        return await query
            .OrderByDescending(b => b.BookingDate)
            .ThenBy(b => b.Time)
            .Select(b => new BookingResponse
            {
                Id = b.Id,
                UserId = b.UserId,
                BookingDate = b.BookingDate,
                Time = b.Time,
                Status = b.Status,
                TotalAmount = b.TotalAmount
            })
            .ToListAsync(cancellationToken);
    }
}
