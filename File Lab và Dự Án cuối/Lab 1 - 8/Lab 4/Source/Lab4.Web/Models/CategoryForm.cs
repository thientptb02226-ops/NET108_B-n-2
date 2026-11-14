using System.ComponentModel.DataAnnotations;

namespace Lab4.Web.Models;

public sealed class CategoryForm
{
    [Required(ErrorMessage = "Nhập tên danh mục.")]
    [StringLength(250)]
    public string Name { get; set; } = "";

    public bool Active { get; set; } = true;
}
