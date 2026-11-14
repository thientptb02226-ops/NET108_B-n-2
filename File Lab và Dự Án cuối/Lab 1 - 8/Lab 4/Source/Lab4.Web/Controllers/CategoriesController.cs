using Lab3.Data;
using Lab3.Entities;
using Lab4.Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace Lab4.Web.Controllers;

[Authorize(Policy = "EmployeeOrManager")]
public sealed class CategoriesController(CategoryDal categories) : Controller
{
    public IActionResult Index() => View(categories.GetAll());

    public IActionResult Details(int id)
    {
        var category = categories.GetById(id);
        return category is null ? NotFound() : View(category);
    }

    [Authorize(Policy = "ManagerOnly")]
    public IActionResult Create() => View(new CategoryForm());

    [HttpPost, ValidateAntiForgeryToken, Authorize(Policy = "ManagerOnly")]
    public IActionResult Create(CategoryForm form)
    {
        if (string.IsNullOrWhiteSpace(form.Name)) ModelState.AddModelError(nameof(form.Name), "Nhập tên danh mục.");
        if (!ModelState.IsValid) return View(form);
        var id = categories.Insert(new Category(0, form.Name.Trim(), form.Active));
        return RedirectToAction(nameof(Details), new { id });
    }

    [Authorize(Policy = "ManagerOnly")]
    public IActionResult Edit(int id)
    {
        var category = categories.GetById(id);
        return category is null ? NotFound() : View(new CategoryForm { Name = category.Name, Active = category.Active });
    }

    [HttpPost, ValidateAntiForgeryToken, Authorize(Policy = "ManagerOnly")]
    public IActionResult Edit(int id, CategoryForm form)
    {
        if (string.IsNullOrWhiteSpace(form.Name)) ModelState.AddModelError(nameof(form.Name), "Nhập tên danh mục.");
        if (!ModelState.IsValid) return View(form);
        return categories.Update(new Category(id, form.Name.Trim(), form.Active))
            ? RedirectToAction(nameof(Details), new { id }) : NotFound();
    }

    [Authorize(Policy = "ManagerOnly")]
    public IActionResult Delete(int id)
    {
        var category = categories.GetById(id);
        return category is null ? NotFound() : View(category);
    }

    [HttpPost, ActionName("Delete"), ValidateAntiForgeryToken, Authorize(Policy = "ManagerOnly")]
    public IActionResult DeleteConfirmed(int id)
    {
        try
        {
            return categories.Delete(id) ? RedirectToAction(nameof(Index)) : NotFound();
        }
        catch (SqlException ex) when (ex.Number == 547)
        {
            ModelState.AddModelError("", "Danh mục đang có sản phẩm, không thể xóa.");
            var category = categories.GetById(id);
            return category is null ? NotFound() : View("Delete", category);
        }
    }
}
