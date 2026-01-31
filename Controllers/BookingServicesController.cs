using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SaloonBookingManagement.Data;
using SaloonBookingManagement.DTOs;
using SaloonBookingManagement.Entities;

namespace SaloonBookingManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingServicesController : ControllerBase
{
    private readonly AppDbContext _db;

    public BookingServicesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<BookingServiceResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var list = await _db.BookingServices
            .OrderBy(bs => bs.BookingId).ThenBy(bs => bs.ServiceId)
            .Select(bs => new BookingServiceResponse { Id = bs.Id, BookingId = bs.BookingId, ServiceId = bs.ServiceId })
            .ToListAsync(cancellationToken);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(BookingServiceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var entity = await _db.BookingServices.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null)
            return NotFound();
        return Ok(new BookingServiceResponse { Id = entity.Id, BookingId = entity.BookingId, ServiceId = entity.ServiceId });
    }

    [HttpPost]
    [ProducesResponseType(typeof(BookingServiceResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] BookingServiceRequest request, CancellationToken cancellationToken)
    {
        var exists = await _db.BookingServices.AnyAsync(bs => bs.BookingId == request.BookingId && bs.ServiceId == request.ServiceId, cancellationToken);
        if (exists)
            return BadRequest("This booking already has this service.");
        var entity = new BookingService { BookingId = request.BookingId, ServiceId = request.ServiceId };
        _db.BookingServices.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, new BookingServiceResponse { Id = entity.Id, BookingId = entity.BookingId, ServiceId = entity.ServiceId });
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(BookingServiceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] BookingServiceRequest request, CancellationToken cancellationToken)
    {
        var entity = await _db.BookingServices.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null)
            return NotFound();
        var duplicate = await _db.BookingServices.AnyAsync(bs => bs.BookingId == request.BookingId && bs.ServiceId == request.ServiceId && bs.Id != id, cancellationToken);
        if (duplicate)
            return BadRequest("This booking already has this service.");
        entity.BookingId = request.BookingId;
        entity.ServiceId = request.ServiceId;
        await _db.SaveChangesAsync(cancellationToken);
        return Ok(new BookingServiceResponse { Id = entity.Id, BookingId = entity.BookingId, ServiceId = entity.ServiceId });
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var entity = await _db.BookingServices.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null)
            return NotFound();
        _db.BookingServices.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
