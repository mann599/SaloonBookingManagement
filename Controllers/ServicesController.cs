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
public class ServicesController : ControllerBase
{
    private readonly AppDbContext _db;

    public ServicesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<ServiceResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var list = await _db.Services
            .OrderBy(s => s.Name)
            .Select(s => new ServiceResponse { Id = s.Id, CategoryId = s.CategoryId, Name = s.Name, Price = s.Price, Duration = s.Duration })
            .ToListAsync(cancellationToken);
        return Ok(list);
    }

    [HttpGet("category/{categoryId:int}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<ServiceResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByCategory(int categoryId, CancellationToken cancellationToken)
    {
        var list = await _db.Services
            .Where(s => s.CategoryId == categoryId)
            .OrderBy(s => s.Name)
            .Select(s => new ServiceResponse { Id = s.Id, CategoryId = s.CategoryId, Name = s.Name, Price = s.Price, Duration = s.Duration })
            .ToListAsync(cancellationToken);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ServiceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var entity = await _db.Services.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null)
            return NotFound();
        return Ok(new ServiceResponse { Id = entity.Id, CategoryId = entity.CategoryId, Name = entity.Name, Price = entity.Price, Duration = entity.Duration });
    }

    [HttpPost]
    [ProducesResponseType(typeof(ServiceResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] ServiceRequest request, CancellationToken cancellationToken)
    {
        var entity = new Service
        {
            CategoryId = request.CategoryId,
            Name = request.Name,
            Price = request.Price,
            Duration = request.Duration
        };
        _db.Services.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, new ServiceResponse { Id = entity.Id, CategoryId = entity.CategoryId, Name = entity.Name, Price = entity.Price, Duration = entity.Duration });
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ServiceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] ServiceRequest request, CancellationToken cancellationToken)
    {
        var entity = await _db.Services.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null)
            return NotFound();
        entity.CategoryId = request.CategoryId;
        entity.Name = request.Name;
        entity.Price = request.Price;
        entity.Duration = request.Duration;
        await _db.SaveChangesAsync(cancellationToken);
        return Ok(new ServiceResponse { Id = entity.Id, CategoryId = entity.CategoryId, Name = entity.Name, Price = entity.Price, Duration = entity.Duration });
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var entity = await _db.Services.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null)
            return NotFound();
        _db.Services.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
