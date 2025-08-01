using Identity.Domain.IServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Identity.Infastucture.Services
{
    public class PasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password)
        {
            var data = System.Text.Encoding.ASCII.GetBytes(password);
            data = System.Security.Cryptography.SHA256.HashData(data);

            return Encoding.ASCII.GetString(data);
        }

        public bool VerifyHashedPassword(string hashedPassword, string providedPassword)
        {
            return HashPassword(providedPassword) == hashedPassword;
        }
    }
}
