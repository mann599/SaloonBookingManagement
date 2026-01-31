namespace SaloonBookingManagement.DTOs;

public class ServiceResponse
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public required string Name { get; set; }
    public decimal Price { get; set; }
    public int Duration { get; set; }
}

public class ServiceRequest
{
    public int CategoryId { get; set; }
    public required string Name { get; set; }
    public decimal Price { get; set; }
    public int Duration { get; set; }
}
