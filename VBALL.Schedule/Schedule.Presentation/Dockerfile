FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5054

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files and restore dependencies
COPY Schedule.Presentation/Schedule.Presentation.csproj Schedule.Presentation/
COPY Schedule.Application/Schedule.Application.csproj Schedule.Application/
COPY Schedule.Infrastructure/Schedule.Infrastructure.csproj Schedule.Infrastructure/
COPY Schedule.Domain/Schedule.Domain.csproj Schedule.Domain/
RUN dotnet restore Schedule.Presentation/Schedule.Presentation.csproj

# Copy source and publish
COPY . .
WORKDIR /src/Schedule.Presentation
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:5054
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Schedule.Presentation.dll"]
