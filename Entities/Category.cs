namespace SaloonBookingManagement.Entities;

public class Category
{
    public int Id { get; set; }
    public required string Name { get; set; }

    public ICollection<Service> Services { get; set; } = new List<Service>();
}
