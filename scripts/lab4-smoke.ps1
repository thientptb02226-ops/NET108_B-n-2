param([int]$Port = 5084, [string]$EvidenceDirectory = '')

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Net.Http
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$labRoot = Get-ChildItem -LiteralPath $root -Directory | Where-Object Name -Like 'File Lab*' | Select-Object -First 1
if (-not $labRoot) { throw 'Lab directory missing.' }
$web = Join-Path $labRoot.FullName 'Lab 1 - 8/Lab 4/Source/Lab4.Web'
$dll = Join-Path $web 'bin/Debug/net10.0/Lab4.Web.dll'
if (-not (Test-Path -LiteralPath $dll)) { throw 'Build Lab4.Web before running smoke.' }
if (-not $env:LAB3_SQL_CONNECTION) {
    $env:LAB3_SQL_CONNECTION = 'Server=(localdb)\MSSQLLocalDB;Database=Net108KhaiLab3;Integrated Security=True;Encrypt=True;TrustServerCertificate=True'
}

$tag = [guid]::NewGuid().ToString('N').Substring(0, 8)
$env:LAB4_MANAGER_EMAIL = "lab4-smoke-manager-$tag@example.invalid"
$env:LAB4_EMPLOYEE_EMAIL = "lab4-smoke-employee-$tag@example.invalid"
$env:LAB4_MANAGER_PASSWORD = "Manager!Aa1$([guid]::NewGuid().ToString('N'))"
$env:LAB4_EMPLOYEE_PASSWORD = "Employee!Aa1$([guid]::NewGuid().ToString('N'))"
& dotnet $dll --seed-users | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Could not seed Lab 4 users.' }

$baseUrl = "http://127.0.0.1:$Port"
$env:ASPNETCORE_ENVIRONMENT = 'Development'
$evidenceRoot = if ($EvidenceDirectory) { [System.IO.Path]::GetFullPath($EvidenceDirectory) } else { '' }
if ($evidenceRoot) { New-Item -ItemType Directory -Path $evidenceRoot -Force | Out-Null }
$process = Start-Process -FilePath 'dotnet' -ArgumentList @("`"$dll`"", '--urls', $baseUrl) -WorkingDirectory $web -WindowStyle Hidden -PassThru
try {
    for ($attempt = 0; $attempt -lt 40; $attempt++) {
        try {
            $probe = [System.Net.Http.HttpClient]::new()
            $response = $probe.GetAsync($baseUrl + '/Login/Login').GetAwaiter().GetResult()
            $probe.Dispose()
            if ([int]$response.StatusCode -eq 200) { break }
        } catch { if ($attempt -eq 0) { Write-Host "Probe error: $($_.Exception.Message)" } }
        Start-Sleep -Milliseconds 250
    }
    if ($attempt -eq 40) { throw "Lab 4 web did not start. Process exited: $($process.HasExited)" }

    function New-Client {
        $handler = [System.Net.Http.HttpClientHandler]::new()
        $handler.AllowAutoRedirect = $false
        $handler.CookieContainer = [System.Net.CookieContainer]::new()
        return [System.Net.Http.HttpClient]::new($handler)
    }
    function Send([System.Net.Http.HttpClient]$client, [string]$method, [string]$path, [hashtable]$form = $null) {
        $request = [System.Net.Http.HttpRequestMessage]::new(
            [System.Net.Http.HttpMethod]::new($method), $baseUrl + $path)
        if ($form) {
            $pairs = [System.Collections.Generic.List[System.Collections.Generic.KeyValuePair[string,string]]]::new()
            foreach ($key in $form.Keys) {
                $pairs.Add([System.Collections.Generic.KeyValuePair[string,string]]::new($key, [string]$form[$key]))
            }
            $request.Content = [System.Net.Http.FormUrlEncodedContent]::new($pairs)
        }
        $response = $client.SendAsync($request).GetAwaiter().GetResult()
        return [pscustomobject]@{
            Status = [int]$response.StatusCode
            Body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
            Location = [string]$response.Headers.Location
        }
    }
    function Token([string]$html) {
        $match = [regex]::Match($html, '<input[^>]*name="__RequestVerificationToken"[^>]*>')
        if (-not $match.Success) { throw 'Antiforgery input missing.' }
        $value = [regex]::Match($match.Value, 'value="([^"]+)"')
        if (-not $value.Success) { throw 'Antiforgery token missing.' }
        return [System.Net.WebUtility]::HtmlDecode($value.Groups[1].Value)
    }
    function Require([bool]$condition, [string]$message) {
        if (-not $condition) { throw $message }
    }
    function SaveEvidence([string]$filename, [string]$html) {
        if ($evidenceRoot) {
            [System.IO.File]::WriteAllText((Join-Path $evidenceRoot $filename), $html, [System.Text.UTF8Encoding]::new($false))
        }
    }

    $anonymous = New-Client
    Require ((Send $anonymous 'GET' '/Categories').Status -eq 302) 'Anonymous category request was not redirected.'

    $manager = New-Client
    $loginPage = Send $manager 'GET' '/Login/Login'
    Require ($loginPage.Status -eq 200) 'Login page failed.'
    SaveEvidence '01-login.html' $loginPage.Body
    $badLogin = Send $manager 'POST' '/Login/Login' @{
        Email = $env:LAB4_MANAGER_EMAIL; Password = 'wrong-password'
        __RequestVerificationToken = (Token $loginPage.Body)
    }
    Require ($badLogin.Status -eq 200 -and (Send $manager 'GET' '/Categories').Status -eq 302) 'Bad password was accepted.'
    $login = Send $manager 'POST' '/Login/Login' @{
        Email = $env:LAB4_MANAGER_EMAIL; Password = $env:LAB4_MANAGER_PASSWORD
        ReturnUrl = '/Categories'; __RequestVerificationToken = (Token $loginPage.Body)
    }
    Require ($login.Status -eq 302) 'Manager login failed.'
    $managerIndex = Send $manager 'GET' '/Categories'
    Require ($managerIndex.Status -eq 200) 'Manager cannot list categories.'
    $createPage = Send $manager 'GET' '/Categories/Create'
    Require ($createPage.Status -eq 200) 'Manager cannot open Create.'
    $invalidCreate = Send $manager 'POST' '/Categories/Create' @{
        Name = '   '; __RequestVerificationToken = (Token $createPage.Body)
    }
    Require ($invalidCreate.Status -eq 200 -and $invalidCreate.Body.Contains('validation-summary-errors')) 'Empty category name was accepted.'
    $name = "Lab4 smoke $tag"
    $created = Send $manager 'POST' '/Categories/Create' @{
        Name = $name; Active = 'true'; __RequestVerificationToken = (Token $createPage.Body)
    }
    Require ($created.Status -eq 302 -and $created.Location -match '/Categories/Details/(\d+)') 'Create failed.'
    $id = [int]$Matches[1]
    $details = Send $manager 'GET' "/Categories/Details/$id"
    Require ($details.Body.Contains($name)) 'Details did not show new category.'
    SaveEvidence '03-manager-details.html' $details.Body
    $editPage = Send $manager 'GET' "/Categories/Edit/$id"
    $updated = Send $manager 'POST' "/Categories/Edit/$id" @{
        Name = "$name updated"; Active = 'true'; __RequestVerificationToken = (Token $editPage.Body)
    }
    Require ($updated.Status -eq 302) 'Edit failed.'
    Require ((Send $manager 'GET' "/Categories/Details/$id").Body.Contains("$name updated")) 'Edit was not persisted.'
    SaveEvidence '02-manager-categories.html' (Send $manager 'GET' '/Categories').Body

    $employee = New-Client
    $employeePage = Send $employee 'GET' '/Login/Login'
    $employeeLogin = Send $employee 'POST' '/Login/Login' @{
        Email = $env:LAB4_EMPLOYEE_EMAIL; Password = $env:LAB4_EMPLOYEE_PASSWORD
        ReturnUrl = '/Categories'; __RequestVerificationToken = (Token $employeePage.Body)
    }
    Require ($employeeLogin.Status -eq 302) 'Employee login failed.'
    $employeeIndex = Send $employee 'GET' '/Categories'
    Require ($employeeIndex.Status -eq 200) 'Employee cannot list.'
    SaveEvidence '04-employee-categories.html' $employeeIndex.Body
    Require ((Send $employee 'GET' "/Categories/Details/$id").Status -eq 200) 'Employee cannot view details.'
    foreach ($path in @('/Categories/Create', "/Categories/Edit/$id", "/Categories/Delete/$id")) {
        $denied = Send $employee 'GET' $path
        Require ($denied.Status -eq 302 -and $denied.Location.Contains('AccessDenied')) "Employee could access $path."
    }
    $deniedPost = Send $employee 'POST' '/Categories/Create' @{ Name = 'Unauthorized' }
    Require ($deniedPost.Status -eq 302 -and $deniedPost.Location.Contains('AccessDenied')) 'Employee could POST Create.'
    $csrfPost = Send $manager 'POST' '/Categories/Create' @{ Name = 'No token' }
    Require ($csrfPost.Status -eq 400) 'Missing antiforgery token was accepted.'

    $deletePage = Send $manager 'GET' "/Categories/Delete/$id"
    $deleted = Send $manager 'POST' "/Categories/Delete/$id" @{
        __RequestVerificationToken = (Token $deletePage.Body)
    }
    Require ($deleted.Status -eq 302) 'Delete failed.'
    Require ((Send $manager 'GET' "/Categories/Details/$id").Status -eq 404) 'Deleted category remains.'

    $index = Send $manager 'GET' '/Categories'
    $logout = Send $manager 'POST' '/Login/Logout' @{
        __RequestVerificationToken = (Token $index.Body)
    }
    Require ($logout.Status -eq 302) 'Logout failed.'
    Require ((Send $manager 'GET' '/Categories').Status -eq 302) 'Cookie still authorizes after logout.'
    'PASS: login/logout, anonymous redirect, roles, CSRF, bad password and category CRUD over HTTP.'
}
finally {
    if ($process -and -not $process.HasExited) { Stop-Process -Id $process.Id -Force }
    Remove-Item Env:LAB4_MANAGER_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:LAB4_EMPLOYEE_PASSWORD -ErrorAction SilentlyContinue
}
