using System.ComponentModel.DataAnnotations;

namespace SaloonBookingManagement.DTOs;

public class RegisterRequest
{
    [Required]
    [MinLength(3)]
    public required string Username { get; set; }

    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [MinLength(6)]
    public required string Password { get; set; }
}
