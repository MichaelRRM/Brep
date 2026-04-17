namespace Brep.WebApi;

public static class ServiceRegistration
{
    public static void RegisterServices(this IServiceCollection services)
    {
        services.AddHttpClient<NexalisClient>();
    }
}