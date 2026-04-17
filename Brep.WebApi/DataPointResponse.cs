namespace Brep.WebApi;

public record DatapointResponse(
    string Datapoint,
    string Site,
    string Units,
    IEnumerable<DatapointValue> Values
);

public record DatapointValue(
    DateTimeOffset Timestamp,
    double Value
);