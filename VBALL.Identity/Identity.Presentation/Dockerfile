FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files and restore dependencies
COPY Identity.Presentation/Identity.Presentation.csproj Identity.Presentation/
COPY Identity.Application/Identity.Application.csproj Identity.Application/
COPY Identity.Infrasructure/Identity.Infrastructure.csproj Identity.Infrasructure/
RUN dotnet restore Identity.Presentation/Identity.Presentation.csproj

# Copy source and publish
COPY . .
WORKDIR /src/Identity.Presentation
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:5000
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Identity.Presentation.dll"]

