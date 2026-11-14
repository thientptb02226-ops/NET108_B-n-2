"""Create the Lab 4 report using the Lab 1 Word document as style baseline."""

from copy import deepcopy
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION_START
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / "docs/labs/reference/Lab1_NET108_AI_Native_Commerce.docx"
OUT = ROOT / "File Lab và Dự Án cuối/Lab 1 - 8/Lab 4/Lab4_NET108_AI_Native_Commerce.docx"
BLUE = RGBColor(31, 78, 121)


def paragraph(doc, value="", *, bold=False, align=None, after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.keep_together = True
    if align is not None:
        p.alignment = align
    r = p.add_run(value)
    r.bold = bold
    return p


def heading(doc, value, level):
    p = doc.add_paragraph(style=f"Heading {level}")
    p.paragraph_format.space_before = Pt(8 if level == 2 else 5)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(value)
    r.bold = True
    r.font.color.rgb = BLUE
    r.font.size = Pt(14 if level == 1 else 13 if level == 2 else 12)


def table(doc, caption, headers, rows):
    cp = paragraph(doc, caption, bold=True, after=3)
    cp.paragraph_format.keep_with_next = True
    cp.runs[0].font.size = Pt(11)
    cp.runs[0].font.color.rgb = BLUE
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = "Table Grid"
    t.rows[0]._tr.get_or_add_trPr().append(OxmlElement("w:tblHeader"))
    for i, name in enumerate(headers):
        c = t.rows[0].cells[i]
        c.text = name
        shade = OxmlElement("w:shd")
        shade.set(qn("w:fill"), "D9EAF7")
        c._tc.get_or_add_tcPr().append(shade)
        for run in c.paragraphs[0].runs:
            run.bold = True
            run.font.size = Pt(10)
    for values in rows:
        cells = t.add_row().cells
        for i, value in enumerate(values):
            cells[i].text = str(value)
            cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            for p in cells[i].paragraphs:
                p.paragraph_format.space_after = Pt(2)
                for run in p.runs:
                    run.font.size = Pt(10)
    paragraph(doc, "", after=1)


def code(doc, *lines):
    for line in lines:
        p = paragraph(doc, line, after=0)
        p.paragraph_format.line_spacing = 1
        p.runs[0].font.name = "Consolas"
        p.runs[0].font.size = Pt(9)


def page_number(p):
    r = p.add_run()
    for kind, name in (("begin", "fldChar"), (None, "instrText"), ("separate", "fldChar"), (None, "t"), ("end", "fldChar")):
        element = OxmlElement(f"w:{name}")
        if kind:
            element.set(qn("w:fldCharType"), kind)
        if name == "instrText":
            element.text = " PAGE "
        if name == "t":
            element.text = "1"
        r._r.append(element)


doc = Document(REFERENCE)
body = doc.element.body
for child in list(body):
    if child.tag != qn("w:sectPr"):
        body.remove(child)
normal = doc.styles["Normal"]
normal.font.name = "Times New Roman"
normal.font.size = Pt(12)
normal.font.color.rgb = RGBColor(0, 0, 0)
normal.paragraph_format.line_spacing = 1.15
normal.paragraph_format.space_after = Pt(6)

cover = doc.sections[0]
cover.page_width, cover.page_height = Cm(21), Cm(29.7)
cover.left_margin, cover.right_margin = Cm(3), Cm(2)
cover.top_margin = cover.bottom_margin = Cm(2)
cover.header.paragraphs[0].text = ""
cover.footer.paragraphs[0].text = ""
borders = OxmlElement("w:pgBorders")
borders.set(qn("w:offsetFrom"), "page")
for edge in ("top", "left", "bottom", "right"):
    line = OxmlElement(f"w:{edge}")
    for key, value in (("val", "double"), ("sz", "12"), ("color", "1F4E79"), ("space", "18")):
        line.set(qn(f"w:{key}"), value)
    borders.append(line)
cover._sectPr.append(borders)

paragraph(doc, "TRƯỜNG CAO ĐẲNG FPT POLYTECHNIC ĐỒNG NAI\nCÔNG NGHỆ THÔNG TIN\n---***---", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, after=54)
p = paragraph(doc, "BÁO CÁO LAB 4", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, after=12)
p.runs[0].font.size = Pt(22)
p.runs[0].font.color.rgb = BLUE
paragraph(doc, "DỰ ÁN MÔN HỌC .NET 1 (NET108) - LỚP: SD22302", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, after=34)
paragraph(doc, "ĐỀ TÀI", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, after=10)
p = paragraph(doc, "XÂY DỰNG HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ\nAI NATIVE COMMERCE", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, after=30)
p.runs[0].font.size = Pt(16)
paragraph(doc, "ASP.NET CORE MVC, ĐĂNG NHẬP VÀ QUẢN LÝ DANH MỤC", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, after=36)
paragraph(doc, "GIẢNG VIÊN HƯỚNG DẪN: ThS. Phan Hoàng Khải\n\nNHÓM SINH VIÊN THỰC HIỆN: NHÓM 5\n"
          "1. Trần Phúc Thiên (TB02226)\n2. Trần Phạm Hoàng Minh (TB02231)\n"
          "3. Cho Hoàng Hiếu Trung (TB02324)\n4. Nguyễn Hoàng Quốc Anh (TB02232)\n"
          "5. Nguyễn Châu Văn Phát (TB02274)", after=55)
paragraph(doc, "Khóa K20\nĐồng Nai, ngày 14 tháng 11 năm 2026", align=WD_ALIGN_PARAGRAPH.CENTER)

section = doc.add_section(WD_SECTION_START.NEW_PAGE)
section.page_width, section.page_height = Cm(21), Cm(29.7)
section.left_margin, section.right_margin = Cm(3), Cm(2)
section.top_margin = section.bottom_margin = Cm(2)
section.header_distance = section.footer_distance = Cm(1)
for old in section._sectPr.findall(qn("w:pgBorders")):
    section._sectPr.remove(old)
section.header.is_linked_to_previous = False
section.footer.is_linked_to_previous = False
hp = section.header.paragraphs[0]
hp.text = "BÁO CÁO LAB 4 - NET108 | NHÓM 5"
hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
for run in hp.runs:
    run.italic = True
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor(100, 100, 100)
ppr = hp._p.get_or_add_pPr()
pb = OxmlElement("w:pBdr")
bottom = OxmlElement("w:bottom")
for key, value in (("val", "single"), ("sz", "6"), ("color", "B7C7D6")):
    bottom.set(qn(f"w:{key}"), value)
pb.append(bottom)
ppr.append(pb)
fp = section.footer.paragraphs[0]
fp.text = "Trang "
fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
page_number(fp)

heading(doc, "KẾ HOẠCH THỰC HIỆN VÀ THEO DÕI", 1)
paragraph(doc, "Lab 4 tiếp nối bài ADO.NET của Lab 3. Phần thực hành này dùng một ứng dụng MVC riêng với CSDL Net108KhaiLab3, không thay giao diện Commerce do Antigravity phụ trách. Bảng dưới ghi các đầu ra đã kiểm tra ngày 14/11/2026.")
table(doc, "Bảng 1. Kế hoạch và bằng chứng Lab 4", ["Bước", "Đầu ra", "Bằng chứng"], [
    ("1. Nền MVC", "Solution .NET 10, cấu hình cookie và policy", "dotnet build: 0 lỗi, 0 cảnh báo"),
    ("2. Đăng nhập", "Hai vai trò Manager/Employee, mật khẩu hash", "HTTP: login, logout và cookie"),
    ("3. Danh mục", "Index, Details, Create, Edit, Delete", "HTTP: CRUD và kiểm quyền hai vai trò"),
    ("4. FileUtil", "Lưu PNG/JPEG với tên ngẫu nhiên", "Self-check: PNG hợp lệ, PNG giả bị từ chối"),
])
paragraph(doc, "Giới hạn: kiểm thử với SQL Server LocalDB và HTTP localhost; chưa kiểm thử Docker hoặc công bố ứng dụng ra Internet. Tài khoản thử được tạo riêng bằng biến môi trường và không ghi mật khẩu trong báo cáo.")

doc.add_page_break()
heading(doc, "MỤC LỤC", 1)
toc = [
    ("PHẦN MỞ ĐẦU", "4"), ("1.1. Tính cấp thiết", "4"), ("1.2. Mục tiêu", "4"),
    ("1.3. Đối tượng và phạm vi", "4"), ("1.4. Phương pháp", "4"),
    ("PHẦN NỘI DUNG", "5"), ("CHƯƠNG 1: CẤU HÌNH ỨNG DỤNG MVC", "5"),
    ("CHƯƠNG 2: ĐĂNG NHẬP VÀ PHÂN QUYỀN", "5"),
    ("CHƯƠNG 3: QUẢN LÝ DANH MỤC", "6"),
    ("CHƯƠNG 4: FILEUTIL VÀ KIỂM THỬ", "6"),
    ("TÀI LIỆU THAM KHẢO", "6"),
]
for label, page in toc:
    p = doc.add_paragraph()
    p.paragraph_format.tab_stops.add_tab_stop(Cm(15.8), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)
    p.paragraph_format.space_after = Pt(7)
    run = p.add_run(f"{label}\t{page}")
    if label.startswith(("PHẦN", "CHƯƠNG", "TÀI")):
        run.bold = True
        run.font.color.rgb = BLUE

doc.add_page_break()
heading(doc, "PHẦN MỞ ĐẦU", 1)
heading(doc, "1.1. Tính cấp thiết của đề tài", 2)
paragraph(doc, "Lab 3 đã có CSDL SQL Server và lớp truy cập dữ liệu. Lab 4 yêu cầu đưa các thành phần đó lên ứng dụng ASP.NET Core MVC, giới hạn thao tác theo người dùng đăng nhập và xây dựng giao diện quản lý danh mục. Việc phân quyền ở controller giúp ngăn thao tác trực tiếp bằng URL đối với nhân viên.")
heading(doc, "1.2. Mục tiêu", 2)
paragraph(doc, "Cấu hình cookie authentication và hai policy EmployeeOrManager, ManagerOnly; đăng nhập/đăng xuất; CRUD danh mục có kiểm quyền; xây FileUtil lưu ảnh an toàn; kiểm chứng bằng build và các yêu cầu HTTP thật.")
heading(doc, "1.3. Đối tượng và phạm vi", 2)
paragraph(doc, "Ứng dụng Lab4.Web .NET 10 tham chiếu Lab3.Data và Lab3.Entities, sử dụng bảng users và categories trong Net108KhaiLab3. Bài làm phục vụ thực hành MVC, không phải website Commerce hoàn chỉnh hoặc luồng đăng ký/khôi phục mật khẩu của sản phẩm chính.")
heading(doc, "1.4. Phương pháp thực hiện", 2)
paragraph(doc, "Đối chiếu đề Lab 4, tái sử dụng DAL Lab 3, thêm phương thức tìm user theo email có tham số SQL, tạo form Razor và chạy thử cả vai trò Manager lẫn Employee. Tài khoản thử có mật khẩu băm bằng PasswordHasher<User>.")

doc.add_page_break()
heading(doc, "PHẦN NỘI DUNG", 1)
heading(doc, "CHƯƠNG 1: CẤU HÌNH ỨNG DỤNG MVC", 2)
heading(doc, "1.1. Cấu trúc và nguồn dữ liệu", 3)
paragraph(doc, "Lab4.Net108Khai.slnx chứa Lab4.Web, Lab3.Data và Lab3.Entities. Connection string lấy từ LAB3_SQL_CONNECTION; Program.cs đăng ký DBUtil, UserDal, CategoryDal và AddControllersWithViews. Source bài Lab 3 đi kèm gói nộp để solution biên dịch độc lập.")
heading(doc, "1.2. Cookie và middleware", 3)
paragraph(doc, "Cookie có LoginPath /Login/Login, AccessDeniedPath /Home/AccessDenied, thời hạn 24 giờ, HttpOnly, SameSite=Lax. Ở môi trường triển khai cookie chỉ đi qua HTTPS; local Development cho phép HTTP để thực hành. Middleware gọi UseAuthentication trước UseAuthorization, sau đó MapControllerRoute.")
code(doc, 'options.AddPolicy("EmployeeOrManager", p => p.RequireRole("Employee", "Manager"));',
     'options.AddPolicy("ManagerOnly", p => p.RequireRole("Manager"));',
     'app.UseAuthentication(); app.UseAuthorization();')

heading(doc, "CHƯƠNG 2: ĐĂNG NHẬP VÀ PHÂN QUYỀN", 2)
heading(doc, "2.1. Kiểm tra tài khoản và tạo claims", 3)
paragraph(doc, "LoginController có GET hiển thị form và POST kiểm tra antiforgery, email, trạng thái active, mật khẩu hash. UserDal.GetByEmail dùng tham số SQL thay vì nối chuỗi. Khi hợp lệ, controller tạo NameIdentifier, Name, Email, Role claim và SignInAsync; ReturnUrl chỉ chấp nhận đường dẫn nội bộ. Logout chỉ có POST và kiểm tra antiforgery.")
heading(doc, "2.2. Ma trận quyền", 3)
table(doc, "Bảng 2. Quyền thao tác trên danh mục", ["Chức năng", "Chưa đăng nhập", "Employee", "Manager"], [
    ("Index, Details", "Chuyển đến Login", "Được", "Được"),
    ("Create, Edit, Delete", "Chuyển đến Login", "Từ chối", "Được"),
])
paragraph(doc, "Quyền được chặn trên action GET và POST, không dựa vào việc ẩn nút trên giao diện. POST đăng nhập còn được giới hạn 10 lần/phút theo địa chỉ IP để giảm thử mật khẩu liên tục.")

heading(doc, "CHƯƠNG 3: QUẢN LÝ DANH MỤC", 2)
heading(doc, "3.1. Hiển thị và xem chi tiết", 3)
paragraph(doc, "CategoriesController gắn EmployeeOrManager ở cấp lớp. Index gọi CategoryDal.GetAll; Details gọi GetById và trả 404 nếu mã không tồn tại. Razor view hiển thị tên và trạng thái danh mục.")
heading(doc, "3.2. Thêm, sửa, xóa", 3)
paragraph(doc, "Create và Edit kiểm tra tên không trống, bỏ khoảng trắng hai đầu, gọi DAL và điều hướng tới Details. Delete yêu cầu xác nhận qua POST; nếu danh mục đang được sản phẩm tham chiếu, ứng dụng báo lỗi khóa ngoại thay vì xóa dữ liệu liên quan. Cả ba nhóm action dùng ManagerOnly và POST có antiforgery token.")
table(doc, "Bảng 3. Kết quả chạy luồng CRUD", ["Yêu cầu HTTP", "Kết quả đã quan sát"], [
    ("Manager tạo danh mục", "302 đến Details; Details hiển thị tên mới"),
    ("Manager sửa danh mục", "302; Details hiển thị tên sau sửa"),
    ("Employee mở Create/Edit/Delete", "302 đến AccessDenied"),
    ("Manager xóa danh mục", "302; Details sau xóa trả 404"),
])

heading(doc, "CHƯƠNG 4: FILEUTIL VÀ KIỂM THỬ", 2)
heading(doc, "4.1. FileUtil", 3)
paragraph(doc, "FileUtil.SaveImageAsync nhận IFormFile và thư mục đích, chỉ chấp nhận PNG/JPEG tối đa 2 MB, kiểm tra signature đầu tệp, đặt tên ngẫu nhiên và lưu bằng FileMode.CreateNew. Tên file do người dùng gửi không được ghép vào đường dẫn đích. Đây là utility phục vụ bài học; màn hình danh mục hiện không có trường ảnh.")
heading(doc, "4.2. Bằng chứng kiểm thử", 3)
table(doc, "Bảng 4. Kiểm chứng thực tế ngày 14/11/2026", ["Kiểm tra", "Kết quả"], [
    ("dotnet build Lab4.Net108Khai.slnx", "Thành công; 0 lỗi, 0 cảnh báo"),
    ("dotnet Lab4.Web.dll --verify-file-util", "PASS: PNG hợp lệ, tên ngẫu nhiên, PNG giả bị từ chối"),
    ("scripts/lab4-smoke.ps1", "PASS: login, logout, role policy, CRUD qua HTTP"),
])
paragraph(doc, "Kiểm thử HTTP dùng SQL Server LocalDB trên máy phát triển. Script tạo tài khoản thử riêng, đăng nhập qua form thật với antiforgery token và làm sạch danh mục thử sau khi xác minh. Các tài khoản thử vẫn còn trong CSDL LocalDB để truy vết, không thuộc source nộp bài.")
heading(doc, "4.3. Cách chạy và giới hạn", 3)
code(doc, "dotnet build '.../Lab 4/Source/Lab4.Net108Khai.slnx'",
     "# Đặt LAB3_SQL_CONNECTION và 4 biến môi trường tài khoản; chạy --seed-users",
     "dotnet run --project '.../Lab 4/Source/Lab4.Web'")
paragraph(doc, "Hướng dẫn đầy đủ ở docs/labs/LAB4-RUN.md. Chưa kiểm thử trên Docker, chưa đo tải hoặc kiểm thử bảo mật chuyên sâu. Chính sách cookie HTTPS cần reverse proxy/TLS khi triển khai thật.")

heading(doc, "TÀI LIỆU THAM KHẢO", 1)
paragraph(doc, "[1] FPT Polytechnic, LAB 4, Dự án .NET 1, đề bài do nhóm cung cấp.")
paragraph(doc, "[2] Net108Khai, Lab3.Net108Khai.slnx và 01-create-and-seed.sql, mã nguồn Lab 3 của nhóm.")
paragraph(doc, "[3] Net108Khai, docs/labs/LAB-REPORT-STANDARD.md và bản Lab 1 tham chiếu, chuẩn trình bày báo cáo.")

OUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUT)
print(OUT.name)
