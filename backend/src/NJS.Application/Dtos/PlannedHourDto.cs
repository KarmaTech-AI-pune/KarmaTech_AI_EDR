using System.Text.Json.Serialization;
using System.Globalization;
using System.Text.Json;

namespace NJS.Application.Dtos
{
    /// <summary>
    /// Custom JSON converter for handling nullable date strings that can be empty, null, or valid dates
    /// </summary>
    public class NullableDateStringConverter : JsonConverter<string?>
    {
        public override string? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            // Handle different JSON token types
            switch (reader.TokenType)
            {
                case JsonTokenType.Null:
                    return null;
                case JsonTokenType.String:
                    var stringValue = reader.GetString();
                    // Return null for empty strings, "null", "undefined", or whitespace
                    if (string.IsNullOrWhiteSpace(stringValue) ||
                        stringValue.Trim().ToLower() == "null" ||
                        stringValue.Trim().ToLower() == "undefined")
                    {
                        return null;
                    }
                    return stringValue;
                default:
                    // For any other token type (like missing values), return null
                    return null;
            }
        }

        public override void Write(Utf8JsonWriter writer, string? value, JsonSerializerOptions options)
        {
            if (value == null)
            {
                writer.WriteNullValue();
            }
            else
            {
                writer.WriteStringValue(value);
            }
        }
    }

    public class PlannedHourDto
    {
        public int Year { get; set; }
        public int MonthNo { get; set; } // Month number (1-12) - changed from string to int

        private DateTime? _date;

        /// <summary>
        /// Optional date field for daily planning. If not provided, defaults to monthly planning.
        /// Accepts various date formats and stores as null if not specified.
        /// Uses custom converter to handle empty values gracefully.
        /// </summary>
        [JsonPropertyName("date")]
        [JsonConverter(typeof(NullableDateStringConverter))]
        public string? DateString
        {
            get => _date?.ToString("yyyy-MM-dd"); // Use standard ISO format for output
            set
            {
                if (string.IsNullOrWhiteSpace(value) || value.Trim().ToLower() == "null" || value.Trim().ToLower() == "undefined")
                {
                    _date = null;
                    return;
                }

                // Try to parse various date formats that frontend might send
                var formats = new[] {
                    "d-M-yyyy",     // 1-7-2025
                    "dd-MM-yyyy",   // 01-07-2025
                    "M-d-yyyy",     // 7-1-2025
                    "MM-dd-yyyy",   // 07-01-2025
                    "yyyy-MM-dd",   // 2025-07-01
                    "d/M/yyyy",     // 1/7/2025
                    "dd/MM/yyyy",   // 01/07/2025
                    "M/d/yyyy",     // 7/1/2025
                    "MM/dd/yyyy"    // 07/01/2025
                };

                foreach (var format in formats)
                {
                    if (DateTime.TryParseExact(value, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedDate))
                    {
                        _date = parsedDate.Date; // Ensure only date part, no time
                        return;
                    }
                }

                // Try general parsing as fallback
                if (DateTime.TryParse(value, out var generalDate))
                {
                    _date = generalDate.Date; // Ensure only date part, no time
                    return;
                }

                // If all parsing fails, set to null instead of throwing exception
                // This prevents JSON deserialization from crashing the application
                _date = null;
            }
        }

        /// <summary>
        /// Optional date for daily planning. When null, indicates monthly planning.
        /// When provided, enables daily planning with 24-hour limit validation.
        /// </summary>
        [JsonIgnore]
        public DateTime? Date
        {
            get => _date;
            set => _date = value?.Date; // Ensure only date part, no time
        }

        /// <summary>
        /// Optional week number (1-53) for weekly planning.
        /// When provided, enables weekly planning with 160-hour limit validation.
        /// </summary>
        public int? WeekNo { get; set; }

        public double PlannedHours { get; set; }
        // public double? ActualHours { get; set; } // Future enhancement
    }
}
