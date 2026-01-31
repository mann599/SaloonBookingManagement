using SaloonBookingManagement.DTOs;
using SaloonBookingManagement.Entities;

namespace SaloonBookingManagement.Services;

public interface IBookingService
{
    Task<List<BookingResponse>> GetMyBookingsAsync(int userId, BookingStatus? status, CancellationToken cancellationToken = default);
}
