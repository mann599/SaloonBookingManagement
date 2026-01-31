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
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<UserResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var list = await _db.Users
            .OrderBy(u => u.Name)
            .Select(u => new UserResponse { Id = u.Id, Name = u.Name, Email = u.Email, Role = u.Role })
            .ToListAsync(cancellationToken);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var entity = await _db.Users.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null)
            return NotFound();
        return Ok(new UserResponse { Id = entity.Id, Name = entity.Name, Email = entity.Email, Role = entity.Role });
    }

    [HttpPost]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] UserRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(request.Password))
            return BadRequest("Password is required for new user.");
        if (await _db.Users.AnyAsync(u => u.Email == request.Email, cancellationToken))
            return BadRequest("Email already exists.");
        var entity = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password!),
            Role = request.Role
        };
        _db.Users.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, new UserResponse { Id = entity.Id, Name = entity.Name, Email = entity.Email, Role = entity.Role });
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UserRequest request, CancellationToken cancellationToken)
    {
        var entity = await _db.Users.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null)
            return NotFound();
        var emailTaken = await _db.Users.AnyAsync(u => u.Email == request.Email && u.Id != id, cancellationToken);
        if (emailTaken)
            return BadRequest("Email already exists.");
        entity.Name = request.Name;
        entity.Email = request.Email;
        entity.Role = request.Role;
        if (!string.IsNullOrEmpty(request.Password))
            entity.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        await _db.SaveChangesAsync(cancellationToken);
        return Ok(new UserResponse { Id = entity.Id, Name = entity.Name, Email = entity.Email, Role = entity.Role });
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var entity = await _db.Users.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null)
            return NotFound();
        _db.Users.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
