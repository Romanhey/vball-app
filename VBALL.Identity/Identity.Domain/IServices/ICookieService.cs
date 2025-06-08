namespace Identity.Domain.IServices
{
    public interface ICookieService
    {
        void AppendResponseCookie(string name, string value);
        string? GetRequestCookie(string key);
        void DeleteCookie(string key);
    }
}
