FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/Net108Khai.Api/Net108Khai.Api.csproj src/Net108Khai.Api/
RUN dotnet restore src/Net108Khai.Api/Net108Khai.Api.csproj
COPY src/Net108Khai.Api/ src/Net108Khai.Api/
RUN dotnet publish src/Net108Khai.Api/Net108Khai.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
RUN mkdir -p /app/keys && chown $APP_UID:$APP_UID /app/keys
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
USER $APP_UID
ENTRYPOINT ["dotnet", "Net108Khai.Api.dll"]
