namespace SaloonBookingManagement.DTOs;

public class BookingServiceResponse
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int ServiceId { get; set; }
}

public class BookingServiceRequest
{
    public int BookingId { get; set; }
    public int ServiceId { get; set; }
}
