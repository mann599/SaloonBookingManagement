-- Creates SaloonBookingDb and all tables. Run in SSMS/Azure Data Studio, or:
--   sqlcmd -S "(localdb)\mssqllocaldb" -i CreateAllTables.sql
-- (Connect without -d so it uses master, then this script creates the DB and tables.)

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'SaloonBookingDb')
    CREATE DATABASE SaloonBookingDb;
GO

USE SaloonBookingDb;
GO

IF OBJECT_ID(N'dbo.BookingServices', N'U') IS NOT NULL DROP TABLE dbo.BookingServices;
IF OBJECT_ID(N'dbo.Bookings', N'U') IS NOT NULL DROP TABLE dbo.Bookings;
IF OBJECT_ID(N'dbo.Services', N'U') IS NOT NULL DROP TABLE dbo.Services;
IF OBJECT_ID(N'dbo.Categories', N'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL DROP TABLE dbo.Users;
GO

CREATE TABLE dbo.Users (
    Id INT IDENTITY(1,1) NOT NULL,
    Name NVARCHAR(MAX) NOT NULL,
    Email NVARCHAR(450) NOT NULL,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    Role INT NOT NULL,
    CONSTRAINT PK_Users PRIMARY KEY (Id),
    CONSTRAINT IX_Users_Email UNIQUE (Email)
);

CREATE TABLE dbo.Categories (
    Id INT IDENTITY(1,1) NOT NULL,
    Name NVARCHAR(MAX) NOT NULL,
    CONSTRAINT PK_Categories PRIMARY KEY (Id)
);

CREATE TABLE dbo.Services (
    Id INT IDENTITY(1,1) NOT NULL,
    CategoryId INT NOT NULL,
    Name NVARCHAR(MAX) NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    Duration INT NOT NULL,
    CONSTRAINT PK_Services PRIMARY KEY (Id),
    CONSTRAINT FK_Services_Categories_CategoryId FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(Id)
);

CREATE TABLE dbo.Bookings (
    Id INT IDENTITY(1,1) NOT NULL,
    UserId INT NOT NULL,
    BookingDate DATE NOT NULL,
    Time TIME NOT NULL,
    Status INT NOT NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    CONSTRAINT PK_Bookings PRIMARY KEY (Id),
    CONSTRAINT FK_Bookings_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
);

CREATE TABLE dbo.BookingServices (
    Id INT IDENTITY(1,1) NOT NULL,
    BookingId INT NOT NULL,
    ServiceId INT NOT NULL,
    CONSTRAINT PK_BookingServices PRIMARY KEY (Id),
    CONSTRAINT FK_BookingServices_Bookings_BookingId FOREIGN KEY (BookingId) REFERENCES dbo.Bookings(Id) ON DELETE CASCADE,
    CONSTRAINT FK_BookingServices_Services_ServiceId FOREIGN KEY (ServiceId) REFERENCES dbo.Services(Id),
    CONSTRAINT IX_BookingServices_BookingId_ServiceId UNIQUE (BookingId, ServiceId)
);

CREATE INDEX IX_Bookings_UserId ON dbo.Bookings(UserId);
CREATE INDEX IX_BookingServices_ServiceId ON dbo.BookingServices(ServiceId);
CREATE INDEX IX_Services_CategoryId ON dbo.Services(CategoryId);
GO
