using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Caching.Memory;

namespace Brep.WebApi;

public class NexalisClient(HttpClient http, IConfiguration config, IMemoryCache memoryCache)
{
    private readonly string _token = config["Nexalis:Token"]!;
    private readonly string _baseUrl = config["Nexalis:BaseUrl"]!;

    public async Task<DatapointResponse?> FetchAsync(string site, string dataPoint,
        DateTimeOffset start, DateTimeOffset end, int bucketSize,
        CancellationToken ct = default, bool skipCache = false)
    {
        var cacheKey = $"nexalis:{site}:{dataPoint}:{start.UtcTicks}:{end.UtcTicks}:{bucketSize}";
        if (!skipCache && memoryCache.TryGetValue(cacheKey, out DatapointResponse? cached))
            return cached;

        var start8601 = start.UtcDateTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
        var end8601 = end.UtcDateTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
        var labelPattern = $"~^(?:{dataPoint})$";

        var body = "{ " +
                   $"'token' '{_token}' " +
                   //$"'class' 'nx.value' " +
                   $"'start' '{start8601}' " +
                   $"'end' '{end8601}' " +
                   $"'bucket_size' {bucketSize} " +
                   $"'labels' {{ 'siteName' '{site}' 'dataPoint' '{labelPattern}' }} " +
                   "} \n@nexalis/fetch_trapezoidal_averages";

        var response = await http.PostAsync(_baseUrl,
            new StringContent(body, Encoding.UTF8, "text/plain"), ct);

        response.EnsureSuccessStatusCode();
        
        var json = await response.Content.ReadAsStringAsync(ct);
        json = Regex.Replace(json, @"\bNaN\b", "null");
        var raw = JsonSerializer.Deserialize<JsonElement[][]>(json);
        var item = raw?[0][0];
        if (item is null) return null;

        var values = item.Value.GetProperty("v")
            .EnumerateArray()
            .Select(v =>
            {
                var arr = v.EnumerateArray().ToArray();
                var microseconds = arr[0].GetInt64();
                var ts = DateTimeOffset.FromUnixTimeMilliseconds(microseconds / 1000);
                return new DatapointValue(ts, arr[1].ValueKind == JsonValueKind.Null ? null : arr[1].GetDouble());
            })
            .OrderBy(v => v.Timestamp)
            .ToList();

        var result = new DatapointResponse(
            Datapoint: item.Value.GetProperty("l")
                .GetProperty("dataPoint").GetString()!,
            Site: item.Value.GetProperty("l")
                .GetProperty("siteName").GetString()!,
            Units: item.Value.GetProperty("a")
                .GetProperty("engUnits").GetString()!,
            Values: values
        );

        if (!skipCache)
            memoryCache.Set(cacheKey, result, TimeSpan.FromMinutes(30));

        return result;
    }
}