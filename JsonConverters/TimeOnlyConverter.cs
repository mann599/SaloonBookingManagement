using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SaloonBookingManagement.JsonConverters;

public class TimeOnlyConverter : JsonConverter<TimeOnly>
{
    private const string Format = "HH:mm:ss";
    private const string FormatShort = "HH:mm";

    public override TimeOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        if (string.IsNullOrEmpty(value))
            return default;

        return TimeOnly.TryParseExact(value, Format, CultureInfo.InvariantCulture, DateTimeStyles.None, out var result)
            || TimeOnly.TryParseExact(value, FormatShort, CultureInfo.InvariantCulture, DateTimeStyles.None, out result)
            ? result
            : TimeOnly.Parse(value, CultureInfo.InvariantCulture);
    }

    public override void Write(Utf8JsonWriter writer, TimeOnly value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString(Format, CultureInfo.InvariantCulture));
    }
}
