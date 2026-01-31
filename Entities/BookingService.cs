namespace SaloonBookingManagement.Entities;

public class BookingService
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int ServiceId { get; set; }

    public Booking Booking { get; set; } = null!;
    public Service Service { get; set; } = null!;
}
