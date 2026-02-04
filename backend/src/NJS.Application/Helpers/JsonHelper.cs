using System;
using System.Collections.Generic;
using System.Text.Json;

namespace NJS.Application.Helpers
{
    public static class JsonHelper
    {
        private static readonly JsonSerializerOptions _options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            WriteIndented = false
        };

        /// <summary>
        /// Serializes an object to a JSON string
        /// </summary>
        public static string? Serialize<T>(T obj)
        {
            if (obj == null)
                return null;

            return JsonSerializer.Serialize(obj, _options);
        }

        /// <summary>
        /// Deserializes a JSON string to an object
        /// </summary>
        public static T? Deserialize<T>(string json)
        {
            if (string.IsNullOrEmpty(json))
                return default;

            try
            {
                return JsonSerializer.Deserialize<T>(json, _options);
            }
            catch (JsonException)
            {
                return default;
            }
        }

        /// <summary>
        /// Serializes a list of strings to a JSON array string
        /// </summary>
        public static string SerializeStringList(List<string> items)
        {
            if (items == null || items.Count == 0)
                return "[]";

            return JsonSerializer.Serialize(items, _options);
        }

        /// <summary>
        /// Deserializes a JSON array string to a list of strings
        /// </summary>
        public static List<string> DeserializeStringList(string json)
        {
            if (string.IsNullOrEmpty(json))
                return new List<string>();

            try
            {
                return JsonSerializer.Deserialize<List<string>>(json, _options) ?? new List<string>();
            }
            catch (JsonException)
            {
                // If the string is not a valid JSON array, treat it as a single item
                if (!string.IsNullOrEmpty(json) && !json.StartsWith("["))
                {
                    return new List<string> { json };
                }
                return new List<string>();
            }
        }
    }
}
