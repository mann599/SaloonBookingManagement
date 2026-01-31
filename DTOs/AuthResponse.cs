namespace SaloonBookingManagement.DTOs;

public class AuthResponse
{
    public required string Token { get; set; }
    public required string Username { get; set; }
    public DateTime ExpiresAt { get; set; }
}
