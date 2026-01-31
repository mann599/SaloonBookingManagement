# Saloon Booking API – Setup & Commands

## Folder structure

```
SaloonBookingManagement/
├── Controllers/
│   ├── AuthController.cs
│   └── WeatherForecastController.cs
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
├── SaloonBookingManagement.csproj
└── WeatherForecast.cs
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

```bash
dotnet ef database update --project SaloonBookingManagement
```

### Run the API

```bash
dotnet run --project SaloonBookingManagement
```

Swagger: `https://localhost:7074/swagger` (or the URL from launchSettings.json).

## Auth endpoints

| Method | Endpoint            | Body (JSON)                                      |
|--------|---------------------|--------------------------------------------------|
| POST   | `/api/auth/register` | `{ "username": "...", "email": "...", "password": "..." }` |
| POST   | `/api/auth/login`    | `{ "username": "...", "password": "..." }`       |

Responses return `{ "token": "...", "username": "...", "expiresAt": "..." }`.

Use the token in Swagger via **Authorize** with value: `Bearer <your-token>`.

## Production notes

- Set **Jwt:Secret** (and other JWT values) via environment variables or a secure config store; use a long, random secret (e.g. 32+ characters).
- Use a real SQL Server connection string in production; avoid storing secrets in `appsettings.json`.
- For production passwords, consider BCrypt or ASP.NET Core Identity instead of the current SHA256 hashing.
