using SaloonBookingManagement.Entities;

namespace SaloonBookingManagement.DTOs;

public class AuthResponse
{
    public required string Token { get; set; }
    public int UserId { get; set; }
    public required string Email { get; set; }
    public UserRole Role { get; set; }
    public DateTime ExpiresAt { get; set; }
}
