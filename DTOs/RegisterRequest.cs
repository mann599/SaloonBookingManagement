using System.ComponentModel.DataAnnotations;

namespace SaloonBookingManagement.DTOs;

public class RegisterRequest
{
    [Required]
    [MinLength(2)]
    public required string Name { get; set; }

    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [MinLength(6)]
    public required string Password { get; set; }
}
