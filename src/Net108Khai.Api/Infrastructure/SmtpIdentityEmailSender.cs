using System.Net;
using System.Net.Mail;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Net108Khai.Api.Domain;

namespace Net108Khai.Api.Infrastructure;

public sealed class SmtpIdentityEmailSender(IConfiguration config) : IEmailSender<CommerceUser>
{
    public Task SendConfirmationLinkAsync(CommerceUser user, string email, string confirmationLink)
    {
        var query = QueryHelpers.ParseQuery(new Uri(WebUtility.HtmlDecode(confirmationLink)).Query);
        if (!query.TryGetValue("code", out var parsedCode))
            throw new InvalidOperationException("Identity confirmation code is missing.");
        var code = parsedCode.ToString();
        if (string.IsNullOrWhiteSpace(code)) throw new InvalidOperationException("Identity confirmation code is missing.");
        return SendAsync(email, "Mã xác thực Net108Khai", $"<p>Nhập mã này để xác thực email:</p><p><strong>{WebUtility.HtmlEncode(code)}</strong></p><p>Mã có hiệu lực 15 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>");
    }

    public Task SendPasswordResetLinkAsync(CommerceUser user, string email, string resetLink) =>
        SendAsync(email, "Đặt lại mật khẩu Net108Khai", $"<p>Liên kết đặt lại mật khẩu: <a href=\"{WebUtility.HtmlEncode(resetLink)}\">mở liên kết</a></p>");

    public Task SendPasswordResetCodeAsync(CommerceUser user, string email, string resetCode) =>
        SendAsync(email, "Mã đặt lại mật khẩu Net108Khai", $"<p>Nhập mã này để đặt lại mật khẩu:</p><p><strong>{WebUtility.HtmlEncode(resetCode)}</strong></p><p>Mã có hiệu lực 15 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>");

    private async Task SendAsync(string email, string subject, string html)
    {
        var host = config["Smtp:Host"] ?? throw new InvalidOperationException("SMTP host missing.");
        var from = config["Smtp:From"] ?? throw new InvalidOperationException("SMTP sender missing.");
        using var message = new MailMessage(from, email, subject, html)
        {
            IsBodyHtml = true, SubjectEncoding = Encoding.UTF8, BodyEncoding = Encoding.UTF8
        };
        using var client = new SmtpClient(host, config.GetValue("Smtp:Port", 587))
        {
            EnableSsl = config.GetValue("Smtp:EnableSsl", true)
        };
        if (!string.IsNullOrWhiteSpace(config["Smtp:User"]))
            client.Credentials = new NetworkCredential(config["Smtp:User"], config["Smtp:Password"]);
        await client.SendMailAsync(message);
    }
}
