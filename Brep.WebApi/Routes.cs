using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace Brep.WebApi;

public static class Routes
{
    public static void MapRoutes(this WebApplication app)
    {
        app.MapGet("/api/test", () => "ok");
        
        app.MapGet("/sites", () => new List<string> {"BrightMesa", "HelioVista", "Sunridge"});
        
        
        app.MapGet("/api/datapoint", async (
            string site, string dataPoint,
            DateTimeOffset? start, DateTimeOffset? end,
            [FromServices] NexalisClient client, [FromServices] IConfiguration config, CancellationToken ct) =>
        {
            var to = end ?? DateTimeOffset.UtcNow;
            var from = start ?? to.AddHours(-1);
            var result = await client.FetchAsync(site, dataPoint, from, to, ct);
            return result is null ? Results.NotFound() : Results.Ok(result);
        });

        // SSE streaming endpoint
        app.MapGet("/api/datapoint/stream", async (
            string site, string dataPoint,
            HttpContext ctx,
            [FromServices] NexalisClient client, [FromServices] IConfiguration config, CancellationToken ct) =>
        {
            var intervalSeconds = config.GetValue<int>("Nexalis:RefreshIntervalSeconds", 30);

            ctx.Response.Headers.ContentType = "text/event-stream";
            ctx.Response.Headers.CacheControl = "no-cache";

            while (!ct.IsCancellationRequested)
            {
                var to = DateTimeOffset.UtcNow;
                var from = to.AddHours(-1);
                var result = await client.FetchAsync(site, dataPoint, from, to, ct);

                if (result is not null)
                {
                    var json = JsonSerializer.Serialize(result);
                    await ctx.Response.WriteAsync($"data: {json}\n\n", ct);
                    await ctx.Response.Body.FlushAsync(ct);
                }

                await Task.Delay(TimeSpan.FromSeconds(intervalSeconds), ct);
            }
        });
    }
}