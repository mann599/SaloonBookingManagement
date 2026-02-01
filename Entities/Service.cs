namespace SaloonBookingManagement.Entities;

public class Service
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public required string Name { get; set; }
    public decimal Price { get; set; }
    public int Duration { get; set; }
    public string? Image { get; set; }

    public Category Category { get; set; } = null!;
    public ICollection<BookingService> BookingServices { get; set; } = new List<BookingService>();
}
