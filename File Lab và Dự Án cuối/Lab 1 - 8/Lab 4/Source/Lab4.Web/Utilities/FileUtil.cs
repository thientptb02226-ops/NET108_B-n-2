namespace Lab4.Web.Utilities;

public static class FileUtil
{
    public const long MaxImageBytes = 2 * 1024 * 1024;

    public static async Task<string> SaveImageAsync(IFormFile file, string storageDirectory, CancellationToken ct = default)
    {
        if (file.Length is <= 0 or > MaxImageBytes)
            throw new InvalidDataException("Ảnh phải có dung lượng từ 1 byte đến 2 MB.");

        await using var input = file.OpenReadStream();
        var header = new byte[8];
        var read = await input.ReadAsync(header, ct);
        var extension = file.ContentType switch
        {
            "image/png" when read == 8 && header.AsSpan().SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }) => ".png",
            "image/jpeg" when read >= 3 && header[0] == 255 && header[1] == 216 && header[2] == 255 => ".jpg",
            _ => throw new InvalidDataException("Chỉ chấp nhận ảnh PNG hoặc JPEG hợp lệ.")
        };

        Directory.CreateDirectory(storageDirectory);
        var name = Path.GetRandomFileName() + extension;
        var path = Path.Combine(storageDirectory, name);
        await using var output = new FileStream(path, FileMode.CreateNew, FileAccess.Write, FileShare.None);
        await output.WriteAsync(header.AsMemory(0, read), ct);
        await input.CopyToAsync(output, ct);
        return name;
    }
}
