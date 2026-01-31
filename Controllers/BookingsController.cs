using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SaloonBookingManagement.Data;
using SaloonBookingManagement.DTOs;
using SaloonBookingManagement.Entities;
using SaloonBookingManagement.Services;

namespace SaloonBookingManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IBookingService _bookingService;

    public BookingsController(AppDbContext db, IBookingService bookingService)
    {
        _db = db;
        _bookingService = bookingService;
    }

    [HttpGet("my")]
    [ProducesResponseType(typeof(List<BookingResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyBookings([FromQuery] BookingStatus? status, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var list = await _bookingService.GetMyBookingsAsync(userId, status, cancellationToken);
        return Ok(list);
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<BookingResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var list = await _db.Bookings
            .OrderBy(b => b.BookingDate).ThenBy(b => b.Time)
            .Select(b => new BookingResponse { Id = b.Id, UserId = b.UserId, BookingDate = b.BookingDate, Time = b.Time, Status = b.Status, TotalAmount = b.TotalAmount })
            .ToListAsync(cancellationToken);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(BookingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var entity = await _db.Bookings.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null)
            return NotFound();
        return Ok(new BookingResponse { Id = entity.Id, UserId = entity.UserId, BookingDate = entity.BookingDate, Time = entity.Time, Status = entity.Status, TotalAmount = entity.TotalAmount });
    }

    [HttpPost]
    [ProducesResponseType(typeof(BookingResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateBookingRequest request, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        if (request.ServiceIds == null || request.ServiceIds.Count == 0)
            return BadRequest("At least one service is required.");

        var services = await _db.Services
            .Where(s => request.ServiceIds.Contains(s.Id))
            .ToListAsync(cancellationToken);

        if (services.Count != request.ServiceIds.Count)
            return BadRequest("One or more service IDs are invalid.");

        var totalAmount = services.Sum(s => s.Price);

        var entity = new Booking
        {
            UserId = userId,
            BookingDate = request.BookingDate,
            Time = request.Time,
            Status = BookingStatus.Pending,
            TotalAmount = totalAmount
        };
        _db.Bookings.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        foreach (var serviceId in request.ServiceIds)
        {
            _db.BookingServices.Add(new SaloonBookingManagement.Entities.BookingService { BookingId = entity.Id, ServiceId = serviceId });
        }
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, new BookingResponse { Id = entity.Id, UserId = entity.UserId, BookingDate = entity.BookingDate, Time = entity.Time, Status = entity.Status, TotalAmount = entity.TotalAmount });
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(BookingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] BookingRequest request, CancellationToken cancellationToken)
    {
        var entity = await _db.Bookings.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null)
            return NotFound();
        entity.UserId = request.UserId;
        entity.BookingDate = request.BookingDate;
        entity.Time = request.Time;
        entity.Status = request.Status;
        entity.TotalAmount = request.TotalAmount;
        await _db.SaveChangesAsync(cancellationToken);
        return Ok(new BookingResponse { Id = entity.Id, UserId = entity.UserId, BookingDate = entity.BookingDate, Time = entity.Time, Status = entity.Status, TotalAmount = entity.TotalAmount });
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var entity = await _db.Bookings.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null)
            return NotFound();
        _db.Bookings.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
