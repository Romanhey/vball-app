    using Identity.Domain.IServices;
    using Microsoft.AspNetCore.Http;

    namespace Identity.Infastucture.Services
    {

        public class CookieService
            (
            IHttpContextAccessor contextAccessor
            ): ICookieService
        {
            private static readonly CookieOptions DefaultCookieOptions = new()
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7)
            };
            public string? GetRequestCookie(string key)
            {
                return contextAccessor.HttpContext?.Request.Cookies[key];
            }
            public void AppendResponseCookie(string key, string? value)
            {
                contextAccessor.HttpContext?.Response.Cookies.Append(key, value, DefaultCookieOptions);
            }
            public void DeleteCookie(string key)
            {
                contextAccessor.HttpContext?.Response.Cookies.Delete(key);
            }
        }
    }
