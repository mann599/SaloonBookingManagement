namespace SaloonBookingManagement.Entities;

public class Booking
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateOnly BookingDate { get; set; }
    public TimeOnly Time { get; set; }
    public BookingStatus Status { get; set; }
    public decimal TotalAmount { get; set; }

    public User User { get; set; } = null!;
    public ICollection<BookingService> BookingServices { get; set; } = new List<BookingService>();
}
