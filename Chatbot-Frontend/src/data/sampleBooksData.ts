import { SampleBook } from '../types';

/**
 * CONTRACT API ĐỌC MẪU (Dành cho Codex backend cung cấp):
 * 1. GET /api/v1/reading/books -> SampleBookSummary[] (bản tóm tắt danh sách sách xuất bản)
 * 2. GET /api/v1/reading/books/{slug} -> SampleBookDetail (chi tiết, mục lục, quyền công bố)
 * 3. GET /api/v1/reading/books/{slug}/chapters/{chapterId} -> SampleChapter (nội dung trang/đoạn trích mẫu)
 *
 * Lưu ý quan trọng: Dữ liệu dưới đây là FIXTURE MẪU (đọc thử hợp pháp các đoạn giới thiệu/mục lục),
 * được biên tập cho Net108Khai, không phải toàn văn bản quyền thương mại.
 */

export const SAMPLE_BOOKS_FIXTURE: SampleBook[] = [
  {
    slug: 'toi-thay-hoa-vang-tren-co-xanh',
    title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
    subtitle: 'Ấn bản kỷ niệm bìa cứng',
    author: 'Nguyễn Nhật Ánh',
    category: 'Văn học & Ký ức tuổi trẻ',
    publishedYear: 2010,
    synopsis: 'Bức tranh làng quê bình dị với tuổi thơ trong trẻo của hai anh em Thiều và Tường. Nơi có tình cảm gia đình ấm áp, những trò chơi con trẻ ngây ngô và những rung động đầu đời man mác khó quên.',
    themeColor: '#3ea48d',
    bgColor: '#fbf6e8',
    physicalProductId: 'book-001',
    physicalProductPriceVnd: 125000,
    licenseNote: 'Trích đoạn đọc mẫu 2 chương đầu phục vụ học tập và giới thiệu tác phẩm theo giấy phép truyền thông Net108Khai.',
    chapters: [
      {
        id: 1,
        chapterNumber: 1,
        title: 'Lời giới thiệu & Hoa tay',
        summary: 'Mở đầu câu chuyện về hai anh em và những ngón tay không có hoa tay nào nhưng chứa chan tình cảm.',
        pages: [
          [
            'Mỗi đứa trẻ sinh ra ở một làng quê Việt Nam đều mang trong mình những ký ức không bao giờ phai nhạt về đồng cỏ xanh, bầu trời cao vút và những trò nghịch ngợm ngây thơ.',
            'Thằng Tường em tôi bảo tôi rằng nó không có hoa tay nào. Tôi xòe cả mười đầu ngón tay ra đếm đi đếm lại, quả thật tôi cũng chẳng có cái hoa tay nào cả. Nhưng ba tôi cười hiền, bảo hoa tay không tạo nên tấm lòng, chỉ có tình yêu thương giữa con người mới làm nên những điều kỳ diệu.'
          ],
          [
            'Ngôi nhà nhỏ của chúng tôi nằm nép mình bên rặng dừa xanh mát. Mùa mưa tới, con đường làng biến thành những con lạch nhỏ, hai anh em xắn quần lội bì bõm đi vớt những chú cá lòng tong lạc dòng.',
            'Tường thường nhường tôi con cá to nhất. Nó luôn nhìn tôi với đôi mắt sáng ngời tin cậy, như thể tôi là người anh vĩ đại nhất trần đời này.'
          ]
        ]
      },
      {
        id: 2,
        chapterNumber: 2,
        title: 'Chú Đàn và chuyện ma làng quê',
        summary: 'Những đêm trăng sáng nghe chú Đàn gảy đàn và kể chuyện ma rùng rợn nhưng hấp dẫn.',
        pages: [
          [
            'Chú Đàn là người đặc biệt nhất làng tôi. Chú có một cây đàn măng-đô-lin cũ kỹ, những đêm trăng thanh gió mát, chú thường ngồi bên bờ giếng gảy những khúc ca tha thiết.',
            'Bọn trẻ con chúng tôi xúm xít quanh chú, vừa run sợ vừa háo hức chờ nghe chú kể những câu chuyện kỳ bí về đồi hoa vàng và những bóng trăng lướt qua ngọn cau.'
          ],
          [
            'Chú Đàn cười khà khà: "Đời người có nhiều nỗi sợ, nhưng sợ nhất là lớn lên mà quên mất mình từng là một đứa trẻ dũng cảm". Câu nói ấy theo tôi suốt những năm tháng ấu thơ cho tới tận bây giờ.',
            'Đọc tiếp trọn vẹn 81 chương hấp dẫn trong ấn bản sách giấy chính thức được phân phối tại Net108Khai Store.'
          ]
        ]
      }
    ]
  },
  {
    slug: 'cho-toi-xin-mot-ve-di-tuoi-tho',
    title: 'Cho Tôi Xin Một Vé Đi Tuổi Thơ',
    subtitle: 'Tác phẩm đạt giải thưởng văn học ASEAN',
    author: 'Nguyễn Nhật Ánh',
    category: 'Văn học & Ký ức tuổi trẻ',
    publishedYear: 2008,
    synopsis: 'Chuyến tàu trở về tuổi thơ của cậu bé Mùi tám tuổi cùng nhóm bạn Tủn, Tí sún và Hải cò. Những trò chơi phá cách, góc nhìn trẻ thơ hóm hỉnh đặt cạnh thế giới người lớn đầy bận rộn.',
    themeColor: '#e07a5f',
    bgColor: '#fdf0ed',
    physicalProductId: 'book-002',
    physicalProductPriceVnd: 110000,
    licenseNote: 'Trích đoạn mẫu phục vụ độc giả làm quen phong cách tác phẩm. Bản quyền Net108Khai đối tác phát hành.',
    chapters: [
      {
        id: 1,
        chapterNumber: 1,
        title: 'Tóm lại là đã hết một ngày',
        summary: 'Cậu bé tám tuổi nhận ra ngày nào cũng na ná ngày nào và bắt đầu công cuộc cải cách thế giới.',
        pages: [
          [
            'Một ngày kia, tôi chợt nhận ra cuộc sống của một đứa trẻ tám tuổi thật tẻ nhạt. Sáng thức dậy, rửa mặt, ăn sáng, đi học, về nhà ăn cơm rồi lại đi ngủ. Ngày nào cũng lặp lại như một cái đồng hồ lên dây cót.',
            'Tôi ngồi ở bậu cửa nhìn ra sân, thở dài đánh sượt một cái. Con Tủn đi qua hỏi: "Mày làm sao thế Mùi?". Tôi bảo: "Tao thấy đời chẳng có gì mới cả!".'
          ],
          [
            'Và thế là chúng tôi bắt đầu một cuộc cách mạng nho nhỏ: Đổi tên gọi các đồ vật trong nhà. Cái bàn gọi là cái ghế, cái giếng gọi là cái gương, và con gà thì gọi là cái quạt máy.',
            'Người lớn không hiểu được niềm vui đó, nhưng với bốn đứa trẻ chúng tôi, thế giới đã trở nên kỳ thú và sống động hơn bao giờ hết!'
          ]
        ]
      },
      {
        id: 2,
        chapterNumber: 2,
        title: 'Bố mẹ tuyệt vời của chúng tôi',
        summary: 'Trò chơi đóng vai bố mẹ và những góc nhìn bất ngờ về cuộc sống gia đình.',
        pages: [
          [
            'Khi chúng tôi đóng vai người lớn, tôi mới thấm thía rằng làm người lớn chẳng sung sướng chút nào. Phải lo đủ thứ chuyện trên đời, từ tiền điện tiền nước đến việc dạy con học bài.',
            'Nhưng dù có nghiêm khắc đến đâu, ánh mắt của bố mẹ khi nhìn chúng tôi say ngủ luôn chứa chan một tình yêu thương vô bờ bến.'
          ],
          [
            'Chiếc vé đi tuổi thơ không bao giờ có người soát vé. Nhưng ai cũng mong một lần được cầm trên tay tấm vé ấy để tìm lại sự hồn nhiên nguyên sơ nhất của tâm hồn.',
            'Khám phá trọn vẹn hành trình đầy ắp tiếng cười và bài học sâu sắc trong ấn bản sách giấy chính hãng tại Net108Khai.'
          ]
        ]
      }
    ]
  },
  {
    slug: 'mat-biec',
    title: 'Mắt Biếc',
    subtitle: 'Tuyệt tác tình cảm học trò & làng Đo Đo',
    author: 'Nguyễn Nhật Ánh',
    category: 'Văn học & Ký ức tuổi trẻ',
    publishedYear: 1990,
    synopsis: 'Mối tình đơn phương da diết của Ngạn dành cho Hà Lan - cô bạn gái có đôi mắt biếc biếc như ngọc. Làng Đo Đo êm đềm với những hàng cau, rừng sim và tiếng ve sầu mùa hạ bất tận.',
    themeColor: '#1d3557',
    bgColor: '#edf2f4',
    physicalProductId: 'book-003',
    physicalProductPriceVnd: 115000,
    licenseNote: 'Bản trích đoạn mẫu phục vụ thưởng thức văn học và giới thiệu ấn bản sách giấy.',
    chapters: [
      {
        id: 1,
        chapterNumber: 1,
        title: 'Làng Đo Đo mùa hạ',
        summary: 'Những ngày thơ ấu êm đềm của Ngạn và Hà Lan dưới tán rừng sim tím ngắt.',
        pages: [
          [
            'Làng tôi là một ngôi làng nhỏ bé nằm nép mình bên sườn đồi. Mùa hạ về, hoa sim tím nở rộ khắp các lối đi, trải dài như một tấm thảm lụa tím biếc dưới nắng mai.',
            'Hà Lan có đôi mắt đẹp lạ lùng. Đôi mắt trong veo như dòng suối đầu nguồn và thẳm sâu như bầu trời mùa thu. Từ thuở tóc còn để chỏm, tôi đã quen nhìn vào đôi mắt ấy.'
          ],
          [
            'Tôi hái cho Hà Lan những quả sim chín mọng nhất, kết cho cô ấy những vòng hoa dại xinh xắn. Hà Lan cười, đôi mắt biếc lấp lánh như gom hết ánh nắng của cả mùa hè Đo Đo.',
            'Tôi cứ ngỡ những ngày tháng êm đềm ấy sẽ kéo dài mãi mãi, như khúc ca không bao giờ dứt của dòng sông quê hương.'
          ]
        ]
      }
    ]
  },
  {
    slug: 'de-men-phieu-luu-ky',
    title: 'Dế Mèn Phiêu Lưu Ký',
    subtitle: 'Văn học thiếu nhi kinh điển Việt Nam',
    author: 'Tô Hoài',
    category: 'Văn học kinh điển Việt Nam',
    publishedYear: 1941,
    synopsis: 'Hành trình trưởng thành đầy sóng gió nhưng quả cảm của Dế Mèn. Từ một chàng dế kiêu căng, xốc nổi đã học được bài học đắt giá về tình bạn, lòng bao dung và khát vọng hòa bình cho muôn loài.',
    themeColor: '#457b9d',
    bgColor: '#f1faee',
    physicalProductId: 'book-004',
    physicalProductPriceVnd: 85000,
    licenseNote: 'Trích đoạn kinh điển thuộc di sản văn học Việt Nam phục vụ học tập theo chương trình phổ thông.',
    chapters: [
      {
        id: 1,
        chapterNumber: 1,
        title: 'Bài học đường đời đầu tiên',
        summary: 'Dế Mèn tự hào về vẻ đẹp cường tráng nhưng phải trả giá bằng ân hận tột cùng với Dế Choắt.',
        pages: [
          [
            'Tôi sống độc lập từ thuở bé. Ấy là tục lệ lâu đời trong họ nhà dế chúng tôi. Vừa lớn lên một chút, mẹ đã cho tôi ra ở riêng trong một căn hầm nhỏ dưới gốc cỏ.',
            'Tôi chăm chỉ ăn uống và làm việc có điều độ, chẳng bao lâu tôi đã trở thành một chàng dế thanh niên cường tráng. Đôi càng tôi mẫm bóng, những cái vuốt ở chân cứ cứng dần và nhọn hoắt.'
          ],
          [
            'Nhưng thói kiêu ngạo đã khiến tôi gây ra cái chết đau lòng cho Dế Choắt khốn khổ. Đứng trước nấm mộ của người bạn xấu số, tôi nghẹn ngào thấm thía bài học đường đời đầu tiên: Ở đời mà có thói hung hăng bậy bạ, có óc mà không biết nghĩ, sớm muộn cũng mang vạ vào mình.'
          ]
        ]
      }
    ]
  },
  {
    slug: 'phuong-phap-tu-hoc-gen-z',
    title: 'Sổ Tay Phương Pháp Tự Học Dành Cho Gen Z',
    subtitle: 'Kỹ năng bứt phá tư duy và tối ưu thời gian',
    author: 'Ban Học Thuật Net108Khai',
    category: 'Kỹ năng & Khoa học',
    publishedYear: 2026,
    synopsis: 'Cẩm nang thực chiến kết hợp kỹ thuật Pomodoro, Feynman, Mindmap và ứng dụng công cụ AI (Antigravity, Codex) để học tập chủ động, ghi nhớ sâu và đạt điểm số ấn tượng.',
    themeColor: '#2a9d8f',
    bgColor: '#e9f5f3',
    physicalProductId: 'book-005',
    physicalProductPriceVnd: 95000,
    licenseNote: 'Bản quyền nội dung thuộc Net108Khai Education. Đọc thử 2 chương nền tảng.',
    chapters: [
      {
        id: 1,
        chapterNumber: 1,
        title: 'Tư duy học tập chủ động thời đại AI',
        summary: 'Chuyển từ người tiếp thu thụ động sang kiến trúc sư tri thức của chính mình.',
        pages: [
          [
            'Trong kỷ nguyên AI bùng nổ, việc ghi nhớ vẹt không còn mang lại lợi thế cạnh tranh. Điều tạo nên sự khác biệt của một học sinh, sinh viên xuất sắc là năng lực ĐẶT CÂU HỎI ĐÚNG và TƯ DUY PHẢN BIỆN.',
            'Học tập chủ động (Active Learning) là quá trình bạn chủ động biến dữ liệu thô thành tri thức ứng dụng được thông qua giải quyết vấn đề thực tế.'
          ],
          [
            'Hãy áp dụng kỹ thuật Feynman: Sau khi đọc một khái niệm mới, hãy thử giảng lại nó cho một người bạn hoặc chính bản thân bằng ngôn ngữ đời thường nhất. Nếu bạn không thể giải thích đơn giản, nghĩa là bạn chưa hiểu sâu.'
          ]
        ]
      }
    ]
  },
  {
    slug: 'lap-trinh-tu-duy-thuat-toan',
    title: 'Tư Duy Thuật Toán & Lập Trình Cơ Bản',
    subtitle: 'Giáo trình thực hành C# và cấu trúc dữ liệu',
    author: 'Ban Chuyên Môn CNTT FPT Polytechnic',
    category: 'Sách giáo khoa & Tham khảo',
    publishedYear: 2026,
    synopsis: 'Tài liệu nhập môn lập trình hiện đại với C# và .NET 10. Tiếp cận từ tư duy giải quyết vấn đề, thuật toán tìm kiếm, sắp xếp cho đến thiết kế giải thuật Clean Code.',
    themeColor: '#264653',
    bgColor: '#e7ecef',
    physicalProductId: 'book-006',
    physicalProductPriceVnd: 150000,
    licenseNote: 'Giáo trình mẫu tham khảo nội bộ NET108, trích đoạn bài mở đầu.',
    chapters: [
      {
        id: 1,
        chapterNumber: 1,
        title: 'Bản chất của giải thuật và tư duy máy tính',
        summary: 'Hiểu cách máy tính tư duy và phương pháp chia nhỏ bài toán phức tạp.',
        pages: [
          [
            'Giải thuật (Algorithm) không phải là những công thức toán học khô khan. Nó đơn giản là một tập hợp các chỉ dẫn từng bước rõ ràng để hoàn thành một mục tiêu cụ thể trong thời gian hữu hạn.',
            'Để viết một chương trình tốt, bước đầu tiên không phải là mở bàn phím gõ code, mà là cầm bút vẽ ra sơ đồ luồng dữ liệu và xác định rõ ràng input/output.'
          ],
          [
            'Khi đối mặt với bài toán lớn, nguyên lý "Chia để trị" (Divide and Conquer) sẽ giúp bạn bẻ nhỏ vấn đề thành các tác vụ nguyên tử (atomic tasks), kiểm thử từng phần độc lập trước khi ráp lại thành hệ thống hoàn chỉnh.'
          ]
        ]
      }
    ]
  }
];
