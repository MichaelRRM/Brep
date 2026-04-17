using Brep.WebApi;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.RegisterServices();

var app = builder.Build();

app.MapOpenApi();
app.UseSwaggerUI(options => 
    options.SwaggerEndpoint("/openapi/v1.json", "v1"));

app.UseHttpsRedirection();

app.MapRoutes();

app.Run();