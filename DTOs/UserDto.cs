using SaloonBookingManagement.Entities;

namespace SaloonBookingManagement.DTOs;

public class UserResponse
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public UserRole Role { get; set; }
}

public class UserRequest
{
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? Password { get; set; }
    public UserRole Role { get; set; }
}
