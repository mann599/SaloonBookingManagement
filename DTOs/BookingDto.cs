using SaloonBookingManagement.Entities;

namespace SaloonBookingManagement.DTOs;

public class BookingResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateOnly BookingDate { get; set; }
    public TimeOnly Time { get; set; }
    public BookingStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
}

public class CreateBookingRequest
{
    public DateOnly BookingDate { get; set; }
    public TimeOnly Time { get; set; }
    public List<int> ServiceIds { get; set; } = new();
}

public class BookingRequest
{
    public int UserId { get; set; }
    public DateOnly BookingDate { get; set; }
    public TimeOnly Time { get; set; }
    public BookingStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
}
