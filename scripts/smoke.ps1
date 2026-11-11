param([string]$BaseUrl = 'http://localhost:8080', [string]$MailpitUrl = 'http://localhost:8025')

$ErrorActionPreference = 'Stop'
$ready = Invoke-RestMethod "$BaseUrl/health/ready"
if ($ready.status -ne 'ready') { throw 'API is not ready' }

function Get-LatestMailCode([string]$Recipient, [string]$Subject) {
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        try {
            $response = Invoke-WebRequest "$MailpitUrl/api/v1/message/latest" -UseBasicParsing
            $mail = [Text.Encoding]::UTF8.GetString($response.RawContentStream.ToArray()) | ConvertFrom-Json
            if (@($mail.To | ForEach-Object { $_.Address }) -contains $Recipient -and $mail.Subject -eq $Subject -and $mail.HTML -match '<strong>([^<]+)</strong>') {
                return [System.Net.WebUtility]::HtmlDecode($Matches[1])
            }
        } catch {
            if ($_.Exception.Response.StatusCode.value__ -ne 404) { throw }
        }
        Start-Sleep -Milliseconds 250
    }
    throw "Confirmation email for $Recipient did not arrive in Mailpit"
}

function Register-And-Confirm([string]$Email, [string]$Password) {
    $body = @{ email = $Email; password = $Password } | ConvertTo-Json
    Invoke-RestMethod -Method Post "$BaseUrl/api/v1/auth/register" -ContentType 'application/json' -Body $body | Out-Null
    $code = Get-LatestMailCode $Email 'Mã xác thực Net108Khai'
    $confirmation = @{ email = $Email; code = $code } | ConvertTo-Json
    Invoke-RestMethod -Method Post "$BaseUrl/api/v1/auth/confirm-email-code" -ContentType 'application/json' -Body $confirmation | Out-Null
}

$email = "smoke-$([guid]::NewGuid().ToString('N'))@example.test"
$password = "Smoke!Aa1$([guid]::NewGuid().ToString('N'))"
$identity = @{ email = $email; password = $password } | ConvertTo-Json
Register-And-Confirm $email $password
$login = Invoke-RestMethod -Method Post "$BaseUrl/api/v1/auth/login" -ContentType 'application/json' -Body $identity
$auth = @{ Authorization = "Bearer $($login.accessToken)" }
$me = Invoke-RestMethod "$BaseUrl/api/v1/auth/me" -Headers $auth
if ($me.email -ne $email -or $me.emailConfirmed -ne $true) { throw 'Identity profile is incorrect' }

Invoke-RestMethod -Method Post "$BaseUrl/api/v1/auth/forgotPassword" -ContentType 'application/json' -Body (@{ email = $email } | ConvertTo-Json) | Out-Null
$resetCode = Get-LatestMailCode $email 'Mã đặt lại mật khẩu Net108Khai'
$newPassword = "Reset!Aa1$([guid]::NewGuid().ToString('N'))"
Invoke-RestMethod -Method Post "$BaseUrl/api/v1/auth/resetPassword" -ContentType 'application/json' -Body (@{ email = $email; resetCode = $resetCode; newPassword = $newPassword } | ConvertTo-Json) | Out-Null
$newLogin = Invoke-RestMethod -Method Post "$BaseUrl/api/v1/auth/login" -ContentType 'application/json' -Body (@{ email = $email; password = $newPassword } | ConvertTo-Json)
if (-not $newLogin.accessToken) { throw 'Password reset login failed' }

$catalog = Invoke-RestMethod "$BaseUrl/api/v1/products"
$variant = @($catalog.items | ForEach-Object { $_.variants } | Where-Object stock -gt 0)[0]
if (-not $variant) { throw 'No variant with stock is available' }

$cart = Invoke-RestMethod -Method Post "$BaseUrl/api/v1/carts" -Headers $auth
$otherEmail = "smoke-$([guid]::NewGuid().ToString('N'))@example.test"
$otherIdentity = @{ email = $otherEmail; password = "Smoke!Aa1$([guid]::NewGuid().ToString('N'))" } | ConvertTo-Json
Register-And-Confirm $otherEmail ($otherIdentity | ConvertFrom-Json).password
$otherLogin = Invoke-RestMethod -Method Post "$BaseUrl/api/v1/auth/login" -ContentType 'application/json' -Body $otherIdentity
try {
    Invoke-RestMethod "$BaseUrl/api/v1/carts/$($cart.id)" -Headers @{ Authorization = "Bearer $($otherLogin.accessToken)" } | Out-Null
    throw 'Cross-user cart access was allowed'
} catch {
    if ($_.Exception.Message -eq 'Cross-user cart access was allowed') { throw }
    if ($_.Exception.Response.StatusCode.value__ -ne 404) { throw }
}
Invoke-RestMethod -Method Put "$BaseUrl/api/v1/carts/$($cart.id)/items/$($variant.id)" -Headers $auth -ContentType 'application/json' -Body '{"quantity":1}' | Out-Null
$view = Invoke-RestMethod "$BaseUrl/api/v1/carts/$($cart.id)" -Headers $auth
if ($view.totalVnd -ne $variant.priceVnd) { throw 'Cart total is incorrect' }

$key = [guid]::NewGuid().ToString()
$headers = @{ Authorization = $auth.Authorization; 'Idempotency-Key' = $key }
$first = Invoke-RestMethod -Method Post "$BaseUrl/api/v1/carts/$($cart.id)/checkout" -Headers $headers
$again = Invoke-RestMethod -Method Post "$BaseUrl/api/v1/carts/$($cart.id)/checkout" -Headers $headers
if ($first.id -ne $again.id -or $again.replayed -ne $true) { throw 'Checkout idempotency failed' }
$order = Invoke-RestMethod "$BaseUrl/api/v1/orders/$($first.id)" -Headers $auth
if ($order.status -ne 'pending_payment' -or $order.totalVnd -ne $variant.priceVnd) { throw 'Order result is incorrect' }

Invoke-RestMethod -Method Post "$BaseUrl/api/v1/orders/$($first.id)/cancel" -Headers $auth | Out-Null
$cancelled = Invoke-RestMethod "$BaseUrl/api/v1/orders/$($first.id)" -Headers $auth
if ($cancelled.status -ne 'cancelled') { throw 'Cancellation failed' }

# The auth policy allows 10 requests per IP per minute; this scenario needs 12.
Start-Sleep -Seconds 61
Invoke-RestMethod -Method Post "$BaseUrl/api/v1/auth/logout" -Headers @{ Authorization = "Bearer $($newLogin.accessToken)" } | Out-Null
try {
    Invoke-RestMethod -Method Post "$BaseUrl/api/v1/auth/refresh" -ContentType 'application/json' -Body (@{ refreshToken = $newLogin.refreshToken } | ConvertTo-Json) | Out-Null
    throw 'Refresh token remained valid after logout'
} catch {
    if ($_.Exception.Message -eq 'Refresh token remained valid after logout') { throw }
    if ($_.Exception.Response.StatusCode.value__ -ne 401) { throw }
}

"PASS: email verification, password reset, owner isolation, order $($first.id), replay, cancellation and refresh revocation"
