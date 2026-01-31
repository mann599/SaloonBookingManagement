# Saloon Booking API – Setup & Commands

## Folder structure

```
SaloonBookingManagement/
├── Controllers/
│   └── AuthController.cs
├── Data/
│   └── AppDbContext.cs
├── DTOs/
│   ├── AuthResponse.cs
│   ├── LoginRequest.cs
│   └── RegisterRequest.cs
├── Entities/
│   └── User.cs
├── Options/
│   └── JwtSettings.cs
├── Properties/
│   └── launchSettings.json
├── Services/
│   ├── AuthService.cs
│   └── IAuthService.cs
├── appsettings.Development.json
├── appsettings.json
├── Program.cs
└── SaloonBookingManagement.csproj
```

## Commands

### Install EF Core CLI (once per machine)

```bash
dotnet tool install --global dotnet-ef
```

### Restore and build

```bash
cd SaloonBookingManagement
dotnet restore
dotnet build
```

### EF Core – initial migration

```bash
dotnet ef migrations add InitialCreate --project SaloonBookingManagement
```

### EF Core – apply migration (create/update database)

From the project folder (where the .csproj is):

```bash
dotnet ef database update
```

Or from the solution/parent folder:

```bash
dotnet ef database update --project SaloonBookingManagement
```

This creates/updates the database and all tables: **Users**, **Categories**, **Services**, **Bookings**, **BookingServices**.

### Alternative: run SQL script (if dotnet ef fails)

If `dotnet restore` or `dotnet ef` fail (e.g. network), create the database and tables manually:

1. Create the database (once): `CREATE DATABASE SaloonBookingDb;` in SSMS/Azure Data Studio.
2. Run `Scripts/CreateAllTables.sql` against that database (drops existing tables then recreates them).

### Run the API

```bash
dotnet run --project SaloonBookingManagement
```

Swagger: `https://localhost:7074/swagger` (or the URL from launchSettings.json).

## Auth endpoints

| Method | Endpoint            | Body (JSON)                                      |
|--------|---------------------|--------------------------------------------------|
| POST   | `/api/auth/register` | `{ "name": "...", "email": "...", "password": "..." }` |
| POST   | `/api/auth/login`    | `{ "name": "...", "password": "..." }`       |

Responses return `{ "token": "...", "name": "...", "expiresAt": "..." }`.

Use the token in Swagger via **Authorize** with value: `Bearer <your-token>`.

## Production notes

- Set **Jwt:Secret** (and other JWT values) via environment variables or a secure config store; use a long, random secret (e.g. 32+ characters).
- Use a real SQL Server connection string in production; avoid storing secrets in `appsettings.json`.
- For production passwords, consider BCrypt or ASP.NET Core Identity instead of the current SHA256 hashing.
