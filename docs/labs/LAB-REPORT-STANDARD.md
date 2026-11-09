# Chuẩn trình bày báo cáo Lab NET108

**Nguồn chuẩn duy nhất:** [Lab 1 do nhóm cung cấp](reference/Lab1_NET108_AI_Native_Commerce.docx). File này là mẫu **bố cục và định dạng** cho báo cáo Lab 2–8. Nội dung, công nghệ, tiến độ và kết luận của từng Lab phải được kiểm chứng theo đề bài và repo tại thời điểm viết.

## Quy trình cho mỗi Lab

1. Đọc đề Lab tương ứng, bản báo cáo Lab 1 và quy chuẩn này. Ghi danh sách đầu việc của đề trước khi soạn.
2. Dùng cùng hệ thống trang, bìa, heading, chú thích, bảng và header/footer dưới đây. Giữ số Lab, tiêu đề chương và mục phù hợp nội dung Lab hiện tại.
3. Dựng mục lục theo heading thực tế và kiểm tra lại số trang sau lần render cuối.
4. Render DOCX thành ảnh từng trang. Kiểm tra bìa, mục lục, tất cả trang có hình/bảng, hàng tiêu đề bảng khi sang trang, số trang và phần tài liệu tham khảo. Chỉ bàn giao khi không có tràn lề, trang trắng ngoài ý muốn hoặc chú thích tách khỏi hình/bảng.

## Hệ thống trang và chữ

| Thành phần | Quy chuẩn từ Lab 1 |
|---|---|
| Khổ giấy | A4 dọc, 21 × 29,7 cm |
| Lề | Trái 3 cm; phải, trên và dưới 2 cm |
| Chữ nội dung | Times New Roman 12 pt, màu đen; giãn dòng khoảng 1,15; đoạn văn canh đều khi phù hợp |
| Bìa | Viền xanh kép; tên trường/khoa ở trên, số Lab và môn học ở giữa, đề tài, giảng viên, nhóm sinh viên, khóa ở dưới |
| Header trang sau bìa | `BÁO CÁO LAB N - NET108 | NHÓM 5`, nghiêng, xám, canh phải, có đường kẻ dưới |
| Footer trang sau bìa | `Trang N`, canh phải |

## Thứ bậc heading

| Cấp | Dùng cho | Hình thức |
|---|---|---|
| Heading 1 | `PHẦN MỞ ĐẦU`, `PHẦN NỘI DUNG`, `TÀI LIỆU THAM KHẢO` | 14 pt, đậm, xanh đậm `#1F4E79`, canh trái |
| Heading 2 | Chương và mục trong phần mở đầu | 13–14 pt, đậm, xanh; chương viết `CHƯƠNG N: TÊN CHƯƠNG` |
| Heading 3 | Mục trong chương `N.x.` | 12–13 pt, đậm, xanh đậm |
| Heading 4 | Tiểu mục `N.x.y.` | 11,5–12 pt, đậm; khi phù hợp dùng nghiêng |

Giữ thứ bậc thật trong DOCX để Word nhận diện heading. Đánh số mục theo chương hiện tại; tránh viết số chỉ bằng ký tự rồi gán toàn bộ là Normal.

## Trật tự báo cáo

1. Bìa một trang, điền thông tin đúng theo Lab 1 và đổi số Lab.
2. Kế hoạch thực hiện: bảng có đầu cột xanh nhạt, ghi đầu việc và kết quả có thật. Chỉ ghi Jira hoặc tỷ lệ hoàn thành khi có dữ liệu kiểm chứng.
3. Mục lục một trang, dòng cấp lớn màu xanh và có số trang đúng.
4. `PHẦN MỞ ĐẦU`: tính cấp thiết, mục tiêu, đối tượng/phạm vi, phương pháp của Lab hiện tại.
5. `PHẦN NỘI DUNG`: các chương phản ánh từng yêu cầu của đề. Chương có thể bắt đầu tiếp trong trang hiện tại như Lab 1; không ép mỗi chương sang trang mới.
6. `TÀI LIỆU THAM KHẢO`: mỗi nguồn một dòng, chỉ dẫn nguồn đã dùng thực tế.

## Hình và bảng

- Hình đặt giữa trang, kích thước vừa vùng in; chú thích **dưới hình**, dạng `Hình N. ...`, Times New Roman 11 pt, nghiêng, xám, canh giữa.
- Bảng có tiêu đề **trên bảng**, dạng `Bảng N. ...`, Times New Roman 11 pt, đậm, xanh đậm. Đầu cột nền xanh nhạt, kẻ ô mảnh; lặp hàng tiêu đề nếu bảng sang trang.
- Đánh số hình/bảng tăng liên tục và đối chiếu với mục lục nếu có danh mục riêng. Giữ hình và chú thích trên cùng trang.

## Ranh giới nội dung

Lab 1 được dùng để học cách trình bày. Sơ đồ ERD, danh sách bảng, công nghệ và các tuyên bố hoàn thành trong Lab 1 không tự động trở thành sự thật của Lab mới. Đối chiếu từng điểm với đề Lab, tài liệu dự án và mã nguồn hiện tại; ghi rõ phần đã chạy và phần mới ở mức thiết kế.

**Đích bàn giao:** DOCX đặt trong `File Lab và Dự Án cuối/Lab 1 - 8/Lab N/`, kèm sơ đồ gốc có thể sửa khi Lab yêu cầu. Bản ZIP nộp chứa đúng các file cuối cùng đã render và kiểm tra.
