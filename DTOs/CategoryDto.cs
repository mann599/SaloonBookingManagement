namespace SaloonBookingManagement.DTOs;

public class CategoryResponse
{
    public int Id { get; set; }
    public required string Name { get; set; }
}

public class CategoryRequest
{
    public required string Name { get; set; }
}
