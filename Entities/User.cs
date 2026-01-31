namespace SaloonBookingManagement.Entities;

public class User
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public UserRole Role { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
