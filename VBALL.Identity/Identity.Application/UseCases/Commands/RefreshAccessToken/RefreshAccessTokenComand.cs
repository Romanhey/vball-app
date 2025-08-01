using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Identity.Application.UseCases.Commands.RefreshAccessToken
{
    public record class RefreshAccessTokenComand(): IRequest<string> {};
}
