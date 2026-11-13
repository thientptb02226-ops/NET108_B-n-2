"""Build the Lab 3 report from the retained Lab 1 Word template."""

from pathlib import Path
from copy import deepcopy

from docx import Document
from docx.enum.section import WD_SECTION_START
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / "docs/labs/reference/Lab1_NET108_AI_Native_Commerce.docx"
OUT = ROOT / "File Lab và Dự Án cuối/Lab 1 - 8/Lab 3/Lab3_NET108_AI_Native_Commerce.docx"
BLUE = RGBColor(31, 78, 121)


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def set_page_border(section):
    sect_pr = section._sectPr
    borders = OxmlElement("w:pgBorders")
    borders.set(qn("w:offsetFrom"), "page")
    for edge in ("top", "left", "bottom", "right"):
        line = OxmlElement(f"w:{edge}")
        line.set(qn("w:val"), "double")
        line.set(qn("w:sz"), "12")
        line.set(qn("w:color"), "1F4E79")
        line.set(qn("w:space"), "18")
        borders.append(line)
    sect_pr.append(borders)


def page_field(paragraph):
    run = paragraph.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instruction = OxmlElement("w:instrText")
    instruction.set(qn("xml:space"), "preserve")
    instruction.text = " PAGE "
    separate = OxmlElement("w:fldChar")
    separate.set(qn("w:fldCharType"), "separate")
    value = OxmlElement("w:t")
    value.text = "1"
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    for element in (begin, instruction, separate, value, end):
        run._r.append(element)


def add_para(doc, text="", *, bold=False, align=None, style=None, after=6):
    paragraph = doc.add_paragraph(style=style)
    paragraph.paragraph_format.space_after = Pt(after)
    paragraph.paragraph_format.line_spacing = 1.15
    paragraph.paragraph_format.keep_together = True
    if align is not None:
        paragraph.alignment = align
    run = paragraph.add_run(text)
    run.bold = bold
    return paragraph


def add_heading(doc, text, level):
    paragraph = doc.add_paragraph(style=f"Heading {level}")
    paragraph.paragraph_format.keep_with_next = True
    paragraph.paragraph_format.space_before = Pt(12 if level == 2 else 8)
    paragraph.paragraph_format.space_after = Pt(6)
    run = paragraph.add_run(text)
    run.bold = True
    run.font.color.rgb = BLUE
    run.font.size = Pt(14 if level == 1 else 13 if level == 2 else 12)
    return paragraph


def add_table(doc, caption, headers, rows, widths=None):
    cp = add_para(doc, caption, bold=True, after=3)
    cp.paragraph_format.keep_with_next = True
    cp.runs[0].font.size = Pt(11)
    cp.runs[0].font.color.rgb = BLUE
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.autofit = False
    for index, title in enumerate(headers):
        cell = table.rows[0].cells[index]
        cell.text = title
        set_cell_shading(cell, "D9EAF7")
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        for run in cell.paragraphs[0].runs:
            run.bold = True
            run.font.size = Pt(10)
        if widths:
            cell.width = Cm(widths[index])
    table.rows[0]._tr.get_or_add_trPr().append(OxmlElement("w:tblHeader"))
    for values in rows:
        row = table.add_row()
        for index, value in enumerate(values):
            cell = row.cells[index]
            cell.text = str(value)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            if widths:
                cell.width = Cm(widths[index])
            for paragraph in cell.paragraphs:
                paragraph.paragraph_format.space_after = Pt(2)
                for run in paragraph.runs:
                    run.font.size = Pt(10)
    doc.add_paragraph().paragraph_format.space_after = Pt(1)
    return table


def add_code(doc, lines):
    for line in lines:
        paragraph = doc.add_paragraph()
        paragraph.paragraph_format.space_after = Pt(0)
        paragraph.paragraph_format.line_spacing = 1.0
        run = paragraph.add_run(line)
        run.font.name = "Consolas"
        run.font.size = Pt(9)


doc = Document(REFERENCE)
body = doc.element.body
for child in list(body):
    if child.tag != qn("w:sectPr"):
        body.remove(child)

normal = doc.styles["Normal"]
normal.font.name = "Times New Roman"
normal.font.size = Pt(12)
normal.font.color.rgb = RGBColor(0, 0, 0)
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.15

cover = doc.sections[0]
cover.page_width, cover.page_height = Cm(21), Cm(29.7)
cover.left_margin, cover.right_margin = Cm(3), Cm(2)
cover.top_margin = cover.bottom_margin = Cm(2)
cover.header_distance = cover.footer_distance = Cm(1)
set_page_border(cover)
cover.header.paragraphs[0].text = ""
cover.footer.paragraphs[0].text = ""

add_para(doc, "TRƯỜNG CAO ĐẲNG FPT POLYTECHNIC ĐỒNG NAI\nCÔNG NGHỆ THÔNG TIN\n---***---", bold=True,
         align=WD_ALIGN_PARAGRAPH.CENTER, after=54)
p = add_para(doc, "BÁO CÁO LAB 3", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, after=12)
p.runs[0].font.size = Pt(22)
p.runs[0].font.color.rgb = BLUE
add_para(doc, "DỰ ÁN MÔN HỌC .NET 1 (NET108) - LỚP: SD22302", bold=True,
         align=WD_ALIGN_PARAGRAPH.CENTER, after=34)
add_para(doc, "ĐỀ TÀI", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, after=10)
p = add_para(doc, "XÂY DỰNG HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ\nAI NATIVE COMMERCE", bold=True,
             align=WD_ALIGN_PARAGRAPH.CENTER, after=30)
p.runs[0].font.size = Pt(16)
add_para(doc, "BÀI THỰC HÀNH SQL SERVER VÀ ADO.NET BA LỚP", bold=True,
         align=WD_ALIGN_PARAGRAPH.CENTER, after=36)
add_para(doc, "GIẢNG VIÊN HƯỚNG DẪN: ThS. Phan Hoàng Khải\n\nNHÓM SINH VIÊN THỰC HIỆN: NHÓM 5\n"
         "1. Trần Phúc Thiên (TB02226)\n2. Trần Phạm Hoàng Minh (TB02231)\n"
         "3. Cho Hoàng Hiếu Trung (TB02324)\n4. Nguyễn Hoàng Quốc Anh (TB02232)\n"
         "5. Nguyễn Châu Văn Phát (TB02274)", after=55)
add_para(doc, "Khóa K20\nĐồng Nai, ngày 13 tháng 11 năm 2026", align=WD_ALIGN_PARAGRAPH.CENTER)

section = doc.add_section(WD_SECTION_START.NEW_PAGE)
section.page_width, section.page_height = Cm(21), Cm(29.7)
section.left_margin, section.right_margin = Cm(3), Cm(2)
section.top_margin = section.bottom_margin = Cm(2)
section.header_distance = section.footer_distance = Cm(1)
for border in section._sectPr.findall(qn("w:pgBorders")):
    section._sectPr.remove(border)
section.header.is_linked_to_previous = False
section.footer.is_linked_to_previous = False
header = section.header.paragraphs[0]
header.text = "BÁO CÁO LAB 3 - NET108 | NHÓM 5"
header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
for run in header.runs:
    run.italic = True
    run.font.name = "Times New Roman"
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor(100, 100, 100)
header_ppr = header._p.get_or_add_pPr()
header_border = OxmlElement("w:pBdr")
bottom = OxmlElement("w:bottom")
bottom.set(qn("w:val"), "single")
bottom.set(qn("w:sz"), "6")
bottom.set(qn("w:color"), "B7C7D6")
header_border.append(bottom)
header_ppr.append(header_border)
footer = section.footer.paragraphs[0]
footer.text = "Trang "
footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
page_field(footer)

add_heading(doc, "KẾ HOẠCH THỰC HIỆN VÀ THEO DÕI", 1)
add_para(doc, "Lab 3 thực hiện một bài ADO.NET tách biệt để đáp ứng đúng đề thực hành. "
         "Backend Commerce tiếp tục dùng EF Core Code First trên SQL Server. "
         "Bảng sau ghi công việc có bằng chứng tại ngày 13/11/2026; chưa gán trạng thái Jira vì chưa đối chiếu board hiện tại.")
add_table(doc, "Bảng 1. Kế hoạch và kết quả Lab 3", ["Bước", "Đầu ra", "Bằng chứng"], [
    ("1. CSDL", "5 bảng, khóa ngoại, dữ liệu mẫu", "SQL script chạy 2 lần trên LocalDB"),
    ("2. Dự án", "3 project C# theo 3 lớp", "Git repo; dotnet build qua"),
    ("3. DBUtil", "QueryDataTable, ExecuteScalar, ExecuteNonQuery", "Microsoft.Data.SqlClient; tham số SQL"),
    ("4. Entity và DAL", "5 entity, 5 DAL, mỗi DAL đủ 5 thao tác", "Console --verify: CRUD qua"),
], [2.2, 6.0, 7.8])
add_para(doc, "Giới hạn: kiểm thử trên SQL Server LocalDB, không phải Docker; bài Lab không thay thế migration EF Core và không chứng minh web Commerce đã hoàn tất.")

doc.add_page_break()
add_heading(doc, "MỤC LỤC", 1)
toc = [
    ("PHẦN MỞ ĐẦU", "4"),
    ("1.1. Tính cấp thiết", "4"),
    ("1.2. Mục tiêu", "4"),
    ("1.3. Đối tượng và phạm vi", "4"),
    ("1.4. Phương pháp thực hiện", "4"),
    ("PHẦN NỘI DUNG", "5"),
    ("CHƯƠNG 1: TẠO CƠ SỞ DỮ LIỆU", "5"),
    ("CHƯƠNG 2: KHỞI TẠO DỰ ÁN BA LỚP", "5"),
    ("CHƯƠNG 3: XÂY DỰNG DBUTIL", "6"),
    ("CHƯƠNG 4: THỰC THỂ, DAL VÀ KIỂM THỬ", "7"),
    ("TÀI LIỆU THAM KHẢO", "7"),
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
add_heading(doc, "PHẦN MỞ ĐẦU", 1)
add_heading(doc, "1.1. Tính cấp thiết của đề tài", 2)
add_para(doc, "Lab 3 chuyển từ mô hình dữ liệu ở các Lab trước sang CSDL có thể truy vấn và mã C# truy cập dữ liệu. "
         "Đề yêu cầu SQL Server và ADO.NET. Dự án Commerce của nhóm đã chuyển EF Core provider sang SQL Server; "
         "bài này bổ sung phần DBUtil và DAL riêng mà EF Core không thay thế trong yêu cầu học phần.")
add_heading(doc, "1.2. Mục tiêu", 2)
add_para(doc, "Tạo 5 bảng có khóa chính/khóa ngoại và dữ liệu mẫu; tổ chức solution thành ba lớp; "
         "viết DBUtil dùng SqlConnection/SqlCommand; xây dựng 5 thực thể và 5 lớp DAL đủ GetAll, GetById, Insert, Update, Delete; "
         "chạy kiểm thử thực trên SQL Server LocalDB.")
add_heading(doc, "1.3. Đối tượng và phạm vi", 2)
add_para(doc, "Bài thực hành dùng đúng năm tên bảng trong đề: categories, drinks, users, bills, bill_details. "
         "Dữ liệu minh họa là đồ dùng học tập để liên hệ với đề tài AI native Commerce. "
         "CSDL Net108KhaiLab3 độc lập với CSDL commerce của API đang phát triển; không dùng bảng users mẫu để đăng nhập thật.")
add_heading(doc, "1.4. Phương pháp thực hiện", 2)
add_para(doc, "Nhóm đối chiếu bốn bài trong đề, tạo script T-SQL có thể chạy lại, tách project theo phụ thuộc "
         "Presentation → Data → Entities và kiểm chứng CRUD trên LocalDB. Đầu ra của Lab là baseline học tập, "
         "chưa tự đánh dấu cổng Waterfall W03–W06 của sản phẩm Commerce.")

doc.add_page_break()
add_heading(doc, "PHẦN NỘI DUNG", 1)
add_heading(doc, "CHƯƠNG 1: TẠO CƠ SỞ DỮ LIỆU", 2)
add_heading(doc, "1.1. Thiết kế bảng và quan hệ", 3)
add_para(doc, "Script 01-create-and-seed.sql tạo database Net108KhaiLab3. Các khóa chính kiểu int IDENTITY và "
         "các khóa ngoại bám đúng ví dụ của đề. Trường tên/mô tả dùng NVARCHAR để lưu tiếng Việt.")
add_table(doc, "Bảng 2. Các bảng dữ liệu của Lab 3", ["Bảng", "Khóa và quan hệ", "Vai trò mẫu"], [
    ("categories", "id PK", "Nhóm hàng"),
    ("drinks", "id PK; category_id FK → categories", "Sản phẩm mẫu"),
    ("users", "id PK; email unique", "Người dùng mẫu, vô hiệu hóa"),
    ("bills", "id PK; user_id FK → users", "Đơn hàng mẫu"),
    ("bill_details", "id PK; bill_id FK → bills; drink_id FK → drinks", "Dòng đơn"),
], [3.0, 7.5, 5.5])
add_heading(doc, "1.2. Tạo dữ liệu và xác minh", 3)
add_para(doc, "Script chèn một danh mục Đồ dùng học tập, một Sổ tay học tập, một user mẫu bị khóa, "
         "một bill và một bill_detail. Tài khoản mẫu chứa chuỗi NO_LOGIN_SAMPLE_RECORD và không phục vụ xác thực. "
         "Các lệnh IF NOT EXISTS cho phép chạy lại script mà không chèn trùng bộ mẫu.")
add_code(doc, [
    "IF DB_ID(N'Net108KhaiLab3') IS NULL CREATE DATABASE Net108KhaiLab3;",
    "-- CREATE TABLE categories / drinks / users / bills / bill_details",
    "-- IF NOT EXISTS (...) INSERT ... -- seed một bộ dữ liệu mẫu",
])
add_para(doc, "Đã chạy script hai lần bằng sqlcmd trên SQL Server LocalDB 17.0.4025.3: lần đầu mỗi bảng thêm một dòng; "
         "lần sau không thêm dòng mới. File T-SQL đầy đủ nằm trong thư mục Database của bài nộp.")

add_heading(doc, "CHƯƠNG 2: KHỞI TẠO DỰ ÁN BA LỚP", 2)
add_heading(doc, "2.1. Tổ chức solution và phụ thuộc", 3)
add_table(doc, "Bảng 3. Ba lớp của solution Lab 3", ["Lớp", "Project", "Trách nhiệm"], [
    ("Presentation", "Lab3.Console", "Chạy ví dụ và kiểm thử; không chứa câu SQL"),
    ("Data access", "Lab3.Data", "DBUtil, 5 DAL, truy vấn có tham số"),
    ("Entity", "Lab3.Entities", "Kiểu dữ liệu của 5 thực thể"),
], [3.2, 4.0, 8.8])
add_para(doc, "Phụ thuộc một chiều: Console → Data → Entities. Bài Lab nằm riêng, không thay đổi API Commerce.")
add_heading(doc, "2.2. Cách chạy", 3)
add_code(doc, [
    "dotnet build '.../Lab 3/Source/Lab3.Net108Khai.slnx'",
    "dotnet run --project '.../Lab 3/Source/Lab3.Console' -- --verify",
])
add_para(doc, "Chi tiết thiết lập biến môi trường LAB3_SQL_CONNECTION và kết nối LocalDB nằm tại docs/labs/LAB3-RUN.md. "
         "Mật khẩu SQL Server không nằm trong source code.")

add_heading(doc, "CHƯƠNG 3: XÂY DỰNG DBUTIL", 2)
add_heading(doc, "3.1. Ba thao tác truy vấn dùng chung", 3)
add_para(doc, "DBUtil nhận connection string ở lúc khởi tạo và cung cấp QueryDataTable cho nhiều dòng, "
         "ExecuteScalar cho một giá trị, ExecuteNonQuery cho UPDATE/DELETE. Mỗi lần gọi mở SqlConnection, tạo SqlCommand, "
         "gắn tham số @1, @2, ... và giải phóng connection bằng using.")
add_table(doc, "Bảng 4. Giao diện DBUtil", ["Hàm", "Kết quả", "Ứng dụng"], [
    ("QueryDataTable", "DataTable", "GetAll, GetById"),
    ("ExecuteScalar", "object?", "Insert + SCOPE_IDENTITY"),
    ("ExecuteNonQuery", "int số dòng", "Update, Delete"),
], [4.5, 3.0, 8.5])
add_heading(doc, "3.2. Tham số và Unicode", 3)
add_para(doc, "Các DAL giữ cố định tên bảng/cột trong mã và truyền dữ liệu qua SqlParameter; "
         "chuỗi dùng SqlDbType.NVarChar theo yêu cầu ví dụ DBUtil trong đề. "
         "Giá trị null đổi thành DBNull.Value. Vì vậy tên sản phẩm tiếng Việt đọc lại nguyên vẹn và "
         "giá trị nhập không được ghép vào câu SQL.")
add_code(doc, [
    "var p = new SqlParameter($\"@{index + 1}\", SqlDbType.NVarChar);",
    "p.Value = value; command.Parameters.Add(p);",
])

doc.add_page_break()
add_heading(doc, "CHƯƠNG 4: THỰC THỂ, DAL VÀ KIỂM THỬ", 2)
add_heading(doc, "4.1. Ánh xạ thực thể và CRUD", 3)
add_para(doc, "Các record Category, Drink, User, Bill, BillDetail dùng int, string, bool và DateOnly tương ứng "
         "với kiểu cột SQL Server. Mỗi lớp DAL có năm hàm yêu cầu. DAL không chứa quy tắc xác thực hay thanh toán của web thật.")
add_table(doc, "Bảng 5. Hàm CRUD trong từng DAL", ["DAL", "GetAll", "GetById", "Insert", "Update", "Delete"], [
    ("CategoryDal", "Có", "Có", "Có", "Có", "Có"),
    ("DrinkDal", "Có", "Có", "Có", "Có", "Có"),
    ("UserDal", "Có", "Có", "Có", "Có", "Có"),
    ("BillDal", "Có", "Có", "Có", "Có", "Có"),
    ("BillDetailDal", "Có", "Có", "Có", "Có", "Có"),
], [3.5, 2.5, 2.5, 2.5, 2.5, 2.5])
add_heading(doc, "4.2. Bằng chứng chạy thử", 3)
add_para(doc, "Console --verify tạo một bộ bản ghi thử với mã ngẫu nhiên, đọc và sửa từng thực thể, "
         "kiểm GetAll rồi xóa theo thứ tự bill_detail → bill → drink → user → category. "
         "Các dòng seed ban đầu vẫn còn sau kiểm thử.")
add_code(doc, [
    "PASS: GetAll, GetById, Insert, Update for all five entities.",
    "PASS: Delete for all five entities; sample rows remain.",
])
add_para(doc, "Lệnh dotnet build của solution Lab 3 thành công, không có lỗi. "
         "Bài được chạy trên SQL Server LocalDB, chưa kiểm trên Docker vì Docker Engine không hoạt động trong phiên này.")
add_heading(doc, "4.3. Ranh giới với sản phẩm Commerce", 3)
add_para(doc, "Bảng drinks/bills của đề là mô hình thực hành và không được dùng làm schema bán hàng thật. "
         "Commerce dùng EF Core Code First SQL Server trong src/Net108Khai.Api, có Identity, catalog, cart và order riêng. "
         "Việc đạt bài Lab này không tự nghiệm thu các cổng Waterfall của web thương mại.")

add_heading(doc, "TÀI LIỆU THAM KHẢO", 1)
add_para(doc, "[1] FPT Polytechnic, LAB 3, Dự án .NET 1, tài liệu đề bài do nhóm cung cấp.")
add_para(doc, "[2] Net108Khai, 01-create-and-seed.sql và solution Lab3.Net108Khai.slnx, mã nguồn bài thực hành ngày 13/11/2026.")
add_para(doc, "[3] Net108Khai, docs/02-ky-thuat/SQLSERVER-TRANSITION-LAB3.md, quyết định provider Commerce và phạm vi riêng của Lab 3.")

OUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUT)
print(OUT.name)
