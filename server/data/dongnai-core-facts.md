# ĐỒNG NAI MỚI – FACT NỘI BỘ CHO SMARTMAP

Tài liệu này dùng để HIỆU CHỈNH cách trả lời của mô hình AI về tỉnh Đồng Nai mới
sau khi sáp nhập. Nếu có mâu thuẫn với kiến thức phổ thông, LUÔN coi tài liệu này là ĐÚNG
trong phạm vi hệ thống SmartMap.

---

## I) QUY TẮC SỐ LIỆU (RẤT QUAN TRỌNG)

- Khi người dùng hỏi về **số lượng, tỉ lệ, dân số, diện tích, GDP, GRDP, sản lượng** hoặc bất kỳ dạng **số liệu định lượng** nào, bạn phải tuân theo quy tắc:
  1. **CHỈ** được dùng các con số **có xuất hiện rõ ràng trong tài liệu nội bộ này** hoặc **dữ liệu JSON của hệ thống**.
  2. Nếu trong tài liệu **không có con số tương ứng**, bạn **KHÔNG ĐƯỢC TỰ ĐOÁN** hoặc suy luận từ kiến thức bên ngoài.
  3. Trong trường hợp thiếu số liệu, hãy trả lời theo mẫu:
     > “Hiện trong tài liệu nội bộ của hệ thống SmartMap **chưa có số liệu cập nhật** cho nội dung này, nên tôi không thể cung cấp con số chính xác. Thông tin có thể đang được cập nhật thêm.”
  4. Nếu có số liệu nhưng không ghi rõ mốc thời gian, hãy ghi chú:
     > “Số liệu này chỉ mang tính tham khảo tại thời điểm xây dựng mô hình Đồng Nai mới, có thể khác với số liệu thống kê chính thức theo từng năm.”
  - Đồng Nai mới: Đồng Nai sau sáp nhập theo mô hình hệ thống SmartMap (hiệu lực theo bối cảnh 2025).
  - Đồng Nai cũ: Đồng Nai trước sáp nhập (các số liệu năm 2011/2012/2018/2019/2020… trong trích đoạn).
  - Khi trả lời câu hỏi số liệu:
    - Nếu người dùng hỏi “Đồng Nai” mà không nói rõ năm, ưu tiên Đồng Nai mới – bộ số liệu 2025 (mục 1).
    - Nếu người dùng hỏi theo năm cụ thể (2019, 2020, 2011…) → dùng đúng mục tương ứng (mục 2).

---

## II) PHÂN LOẠI SỐ LIỆU: KHI NÀO ĐƯỢC DÙNG KIẾN THỨC CŨ

### A) Nhóm A – Số liệu hành chính & dân cư (RẤT NHẠY CẢM)

Các câu hỏi sau đây **KHÔNG ĐƯỢC** dùng kiến thức cũ ngoài tài liệu nội bộ / dữ liệu JSON:

- Số lượng đơn vị hành chính: tổng số xã/phường, số xã/phường trong một khu vực.
- Đơn vị hành chính “thuộc” tỉnh/huyện/thị xã nào.
- Dân số, mật độ dân số, diện tích hành chính của xã/phường/tỉnh Đồng Nai mới.
- GRDP, GDP, thu nhập bình quân, tỉ lệ đô thị hoá, tỉ lệ nghèo… theo từng xã/phường hoặc cho toàn tỉnh Đồng Nai mới.

Đối với Nhóm A:
- **CHỈ** dùng số liệu trong tài liệu nội bộ hoặc dữ liệu JSON.
- Nếu không có số liệu, bắt buộc trả lời theo mẫu thiếu số liệu (ở mục I).

### B) Nhóm B – Địa lí tự nhiên & công trình cố định (ĐƯỢC DÙNG KIẾN THỨC CHUNG)

Các câu hỏi sau đây **CÓ THỂ** sử dụng kiến thức chung ngoài tài liệu nội bộ:

- Chiều cao núi, đèo.
- Diện tích mặt nước của hồ, hồ chứa.
- Chiều dài sông hoặc đoạn sông chảy qua khu vực Đồng Nai mới (mức độ ước lượng).
- Thông số cơ bản của đập thủy điện, cầu lớn, công trình hạ tầng ít thay đổi.
- Diện tích vườn quốc gia, khu bảo tồn thiên nhiên, khu du lịch đã được công bố rộng rãi.

Quy ước:
- Có thể trả lời bằng số liệu “xấp xỉ”.
- Nên dùng “khoảng”, “xấp xỉ”, “ước tính”.
- Có thể kèm chú thích: “Số liệu có thể chênh lệch đôi chút giữa các nguồn thống kê.”

### C) Nhóm C – Kinh tế – xã hội, thống kê theo thời gian (HẠN CHẾ DÙNG SỐ)

Các câu hỏi về:
- Lượng khách du lịch/năm, doanh thu du lịch, sản lượng công nghiệp, nông nghiệp theo năm.
- Thu nhập bình quân, tỉ lệ thất nghiệp, tỉ lệ dịch vụ, v.v.

Quy ước:
- Nếu tài liệu nội bộ **không nêu rõ con số và mốc thời gian**, **KHÔNG** được tự bịa số.
- Chỉ mô tả xu hướng định tính.
- Nếu có số liệu trong tài liệu nội bộ, **LUÔN** ghi rõ mốc thời gian.

---

## III) FACT CỨNG: CẤP XÃ (SỐ LIỆU HỆ THỐNG)

- Tổng số đơn vị hành chính cấp xã: **95**
- Số xã: **72**
- Số phường: **23**
- Diện tích: 12.737 km² (xếp 9)
- Dân số: 4.491.408 người (xếp 5)
- GRDP 2024: 609.176.602 triệu VNĐ (xếp 4)
- Thu ngân sách 2024: 73.458.454 triệu VNĐ (xếp 4)
- Thu nhập bình quân: 78,04 triệu VNĐ/năm (xếp 4)

Ghi chú:
- Khi người dùng hỏi “tổng số xã/phường của Đồng Nai mới”, **PHẢI** ưu tiên dùng các số liệu tại mục này.

---

## IV) KHÁI QUÁT TỈNH ĐỒNG NAI MỚI (KHUNG NỘI DUNG)

* **Phạm vi sử dụng trong SmartMap**

  * Trong hệ thống SmartMap, “**Đồng Nai**” mặc định được hiểu là **Tỉnh Đồng Nai mới** theo mô hình sáp nhập (trừ khi người dùng nêu rõ một tỉnh khác).
  * Khi người dùng hỏi “tỉnh Đồng Nai là gì / ở đâu / có gì nổi bật”, ưu tiên trả lời **tổng quan + vai trò liên kết vùng + cấu trúc hành chính mới (tỉnh → xã/phường)**.

* **Tổng quan định danh**

  * Đồng Nai là một tỉnh thuộc **vùng Đông Nam Bộ, Việt Nam**.
  * Trung tâm hành chính (theo nguồn bạn cung cấp) là **thành phố Biên Hòa**.

* **Chỉ số tổng hợp cấp tỉnh (chỉ dùng đúng số liệu bạn đã cung cấp)**

  * **Diện tích:** 12.737 km²
  * **Dân số:** 4.491.408 người
  * **GRDP 2024:** 609.176.602 triệu VNĐ
  * **Thu ngân sách 2024:** 73.458.454 triệu VNĐ
  * **Thu nhập bình quân:** 78,04 triệu VNĐ/năm
  * Nếu hỏi “xếp hạng” thì dùng đúng: diện tích **thứ 9**, dân số **thứ 5**, GRDP **thứ 4**, thu ngân sách **thứ 4**, thu nhập bình quân **thứ 4** (theo dữ liệu sáp nhập 2025 bạn đưa).

* **Vai trò/định vị vùng (định tính, không tự thêm số liệu)**

  * Nằm trong **vùng kinh tế trọng điểm phía Nam**, được mô tả là **cửa ngõ** kết nối và giao thương của khu vực.
  * Thuộc nhóm tỉnh có **công nghiệp – dịch vụ phát triển**, gắn với các trục giao thông và hệ thống khu công nghiệp (trình bày ở mục giao thông/kinh tế).

* **Đặc điểm không gian phát triển (tóm tắt theo nguồn bạn gửi)**

  * Địa hình chủ đạo: **đồng bằng và trung du**, có **núi thấp rải rác**, xu hướng thấp dần theo hướng bắc–nam.
  * Tài nguyên và sinh thái: có hệ sinh thái rừng nhiệt đới tiêu biểu (như **Vườn quốc gia Nam Cát Tiên** theo nguồn), nguồn khoáng sản đa dạng (chỉ nêu định tính).
  * Khí hậu: **nhiệt đới gió mùa**, có **mùa mưa – mùa khô** (chi tiết số liệu khí hậu chỉ dùng nếu bạn muốn giữ nguyên các con số đã cung cấp).

---


## V) VỊ TRÍ ĐỊA LÝ & RANH GIỚI (KHUNG NỘI DUNG)
- Thuộc vùng Đông Nam Bộ; vùng kinh tế trọng điểm Nam Bộ.Là cửa ngõ kết nối, có vai trò trong “tứ giác phát triển” / “tam giác phát triển” theo mô tả trong nguồn.
- Tọa độ: 10°30'03B – 11°34'57B; 106°45'30Đ – 107°35'00Đ
- Giáp:
  - Đông: Lâm Đồng
  - Tây: TP.HCM, Tây Ninh
  - Nam: TP.HCM
  - Bắc: các tỉnh của Campuchia (Tboung Khmum)

- Tọa độ (số liệu cố định)
  Vĩ độ: 10°30'03B – 11°34'57B
  Kinh độ: 106°45'30Đ – 107°35'00Đ
- Điều kiện tự nhiên
  Địa hình: đồng bằng + trung du, núi sót rải rác; thấp dần theo hướng Bắc–Nam.
  Nhóm đất: (1) đất trên đá bazan, (2) đất trên phù sa cổ & đá phiến sét, (3) đất trên phù sa mới.
  Tài nguyên: rừng nhiệt đới (tiêu biểu Nam Cát Tiên), khoáng sản đa dạng (mô tả theo nguồn).
- Khí hậu (số liệu cố định theo mô tả nguồn)
  2 mùa: mùa khô (tháng 12–4), mùa mưa (tháng 5–11).
  Nhiệt độ trung bình năm: 25–27°C
  Cực trị: cao khoảng 40°C, thấp 12,5°C
  Số giờ nắng: 2.500–2.700 giờ/năm
  Độ ẩm trung bình: 80–82%

---

## VI) MÔ HÌNH HÀNH CHÍNH TRONG SMARTMAP (BẮT BUỘC TUÂN THỦ)

⚠️ Đây là phần rất dễ sai đối với mô hình AI, cần tuân thủ tuyệt đối:

- Trong mô hình Đồng Nai mới của SmartMap:
  - **KHÔNG sử dụng** các cấp: huyện, thị xã, thị trấn, quận.
  - Chỉ sử dụng các cấp:
    - **Tỉnh Đồng Nai mới**
    - **Xã / phường**
    - **Thôn / ấp / tổ dân phố** (khi cần chi tiết hơn)

- Khi mô tả địa giới:
  - Dùng mẫu câu:
    - “Xã A, tỉnh Đồng Nai mới.”
    - “Thôn X nằm trên địa bàn xã Y, tỉnh Đồng Nai mới.”
  - **KHÔNG được sinh ra** các câu dạng:
    - “thuộc huyện …”, “thuộc thị xã …”, “thuộc quận …”
    - “thuộc tỉnh Bình Phước”, “thuộc tỉnh Đồng Nai (cũ)”, v.v.

- Các đơn vị hành chính cấp “huyện/thị xã/thành phố” trước đây của hai tỉnh cũ
  chỉ nên được nhắc đến như **thông tin lịch sử hoặc bối cảnh**.

---

## VII) ĐỊA DANH CŨ – MỚI & CÁCH XỬ LÝ TRONG TRẢ LỜI

* **Quy ước bắt buộc khi người dùng hỏi theo tên cũ**

  * Nếu người dùng dùng các cụm như: “**huyện…**”, “**thị xã…**”, “**tỉnh Bình Phước**”, “**thị trấn…**”, “**quận…**”:

    * **Không khẳng định** theo hệ cũ như một đơn vị hành chính hiện hành trong SmartMap.
    * **Giải thích ngắn gọn bối cảnh:** “đây là cách gọi theo đơn vị hành chính trước sáp nhập / trước mô hình Đồng Nai mới”.
    * **Chuyển sang mô hình mới:** đưa về “xã/phường thuộc tỉnh Đồng Nai mới” (nếu xác định được xã/phường tương ứng trong dữ liệu hệ thống).

* **Mẫu câu chuẩn để chuyển đổi (dùng thống nhất)**

  1. **Khi hỏi theo tên cấp huyện/thị xã cũ**

     * “*‘Huyện/Thị xã X’ là cách gọi theo hệ hành chính trước sáp nhập. Trong SmartMap, hệ hành chính hiện dùng là **tỉnh → xã/phường**. Bạn muốn xem thông tin **xã/phường cụ thể** nào trong khu vực X?*”
  2. **Khi hỏi theo tỉnh Bình Phước (cũ)**

     * “*Trong bối cảnh SmartMap, khu vực trước đây thuộc **tỉnh Bình Phước** hiện được tính trong **tỉnh Đồng Nai mới**. Bạn đang hỏi về **xã/phường** nào?*”
  3. **Khi đã nhận diện được xã/phường từ câu hỏi**

     * “*Khu vực bạn nhắc đến (tên cũ) hiện tương ứng với **{xã/phường A}**, tỉnh Đồng Nai mới. Dưới đây là thông tin của {xã/phường A}…*”

* **Cách ghi chú bối cảnh lịch sử (ngắn và không gây nhiễu)**

  * Chỉ cần 1 câu “bối cảnh” rồi đi thẳng vào nội dung chính:

    * “*Lưu ý: tên gọi bạn dùng là theo hệ trước sáp nhập; trong SmartMap, thông tin được trình bày theo xã/phường thuộc tỉnh Đồng Nai mới.*”
  * Tránh liệt kê dài các mốc lịch sử nếu người dùng không hỏi lịch sử; lịch sử chỉ mở rộng khi câu hỏi thực sự về “hình thành / thay đổi địa giới / trước đây thuộc đâu”.

---

## VIII) KINH TẾ – CƠ CẤU NGÀNH (KHUNG NỘI DUNG)

- Kinh tế – năm 2020 (Đồng Nai cũ)
  Dân số: 3.097.107 người
  GRDP: gần 400.000 tỉ đồng (≈ 17,2 tỉ USD)
  GRDP bình quân đầu người: 124 triệu đồng (≈ 5.300 USD)
  Tốc độ tăng trưởng GRDP (dự kiến): trên 9,0%

- Kinh tế – năm 2011 (Đồng Nai cũ)
  GDP tăng: 13,32% so với năm 2010
  Dịch vụ: +14,9%
  Nông, lâm nghiệp & thủy sản: +3,9%
  Công nghiệp – xây dựng: +14,2%
  Quy mô GDP: 96.820 tỷ đồng
  GDP bình quân đầu người: 36,6 triệu đồng

  Cơ cấu kinh tế:
  Công nghiệp – xây dựng: 57,3%
  Nông, lâm nghiệp & thủy sản: 7,5%
  Dịch vụ: 35,2%
  Xuất khẩu: 9,8 tỷ USD
  Thu ngân sách: 22.641,2 tỷ đồng
  FDI: 900 triệu USD
  Vốn đầu tư trong nước: 15.000 tỷ đồng
  Hộ nghèo (2011): giảm 7.800 hộ, tỷ lệ còn 5%
  Vay vốn hộ nghèo: 5.200 lượt hộ, 67 tỷ đồng

- Kinh tế – năm 2012 (Đồng Nai cũ)
  9 tháng đầu năm:
  Sản xuất công nghiệp: tăng hơn 7%
  Dịch vụ: tăng 14,51% (so với cùng kỳ)
  Tổng mức bán lẻ: tăng 20%
  CPI: tăng 6,14% so với cuối 2011
  Xuất khẩu: trên 7,9 tỷ USD
  Nhập khẩu: hơn 7,5 tỷ USD

- Kinh tế – năm 2019 (Đồng Nai cũ)
  GDP bình quân đầu người: 3.720 USD/người (≈ 60,4 triệu đồng)
  Hộ nghèo: 9.200 hộ, chiếm khoảng 1,8%
  Chỉ số sản xuất công nghiệp: tăng 8,7%
  Giá trị sản xuất nông – lâm – thủy sản: tăng 2,7%
  Thu ngân sách: 54.431 tỉ đồng
  Chi ngân sách: 22.509 tỉ đồng
  Tổng mức bán lẻ & doanh thu dịch vụ: 173,6 ngàn tỉ đồng
  Xuất khẩu: 19,7 tỉ USD
  Nhập khẩu: 16,5 tỉ USD
  Xuất siêu: khoảng 3,2 tỉ USD
  Vốn đầu tư phát triển: 91.335 tỉ đồng
  Thu hút đầu tư trong nước: 34 nghìn tỉ đồng
  Lũy kế dự án trong nước: 917 dự án, tổng vốn ~325.000 tỉ đồng
  Tổng vốn đầu tư nước ngoài (ước): 1.450 triệu USD
  Lũy kế FDI: 1.457 dự án, vốn đăng kí ~30 tỉ USD
  Doanh nghiệp thành lập mới: 3.850 DN, vốn đăng kí ~34.000 tỉ đồng
  Tổng DN trên địa bàn: ~38.000 DN, tổng vốn đăng kí >264.000 tỉ đồng
---

## IX) DÂN SỐ – DÂN CƯ & XÃ HỘI (KHUNG NỘI DUNG)
- Giáo dục (mốc 30/09/2018)
  Tổng số trường: 745
  THPT: 84
  THCS: 273
  Tiểu học: 362
  Trung học: 23 (mục này trong nguồn khá mơ hồ về “trung học” → không dùng để suy luận thêm loại trường)
  Phổ thông cơ sở: 4
  Mẫu giáo: 327
  Có “cơ sở 2 của Trường Đại học Mở TP.HCM” tại phường Long Bình Tân, TP. Biên Hòa.

- Y tế (Đồng Nai cũ – mô tả định tính + danh sách)
  Mô tả: mạng lưới y tế phát triển; đã thành lập 11 bệnh viện tuyến huyện (theo cách gọi đơn vị hành chính cũ trong nguồn).
  Danh sách bệnh viện (theo nguồn, giữ nguyên tên gọi, không suy diễn):
  Bệnh viện Đa Khoa Đồng Nai
  Bệnh viện Đa khoa Thống Nhất (Bệnh viện Thánh Tâm)
  Bệnh viện Tâm thần Trung ương II (còn gọi là bệnh viện Biên Hòa)
  Bệnh viện Nhi Đồng Đồng Nai
  Bệnh viện Phổi tỉnh
  Bệnh viện Y học cổ truyền
  Bệnh viện 7B
  Bệnh viện Da liễu Tỉnh
  Bệnh viện Đại học Y Dược Shing Mark
  Bệnh viện Đa khoa Cao su Đồng Nai
  Bệnh viện Đa Khoa TP. Biên Hòa
  Bệnh viện Đa Khoa KV. Long Khánh
  Bệnh viện Phụ sản Âu Cơ
  Bệnh viện Răng-Hàm-Mặt Việt Anh Đức
  Bệnh viện đa khoa Tâm Hồng Phước
  Bệnh viện Quốc tế Hoàn Mỹ Đồng Nai
  Bệnh viện Hoàn Mỹ ITO Đồng Nai
  Ghi chú thêm: có “Hệ thống phòng khám và chăm sóc sức khỏe Quốc tế Sỹ Mỹ”.
  
- Dân cư (Đồng Nai cũ – lịch sử dân số + cấu trúc dân số)
  Bảng dân số theo năm (Đồng Nai cũ)
  Chỉ dùng khi người dùng hỏi “năm X” hoặc “giai đoạn 1995–2022…”.
  1995: 1.884.800
  1996: 1.882.200
  1997: 1.920.000
  1998: 1.959.300
  1999: 1.999.500
  2000: 2.054.100
  2001: 2.093.700
  2002: 2.132.200
  2003: 2.176.100
  2004: 2.220.500
  2005: 2.263.800
  2006: 2.314.900
  2007: 2.372.600
  2008: 2.432.700
  2009: 2.499.700
  2010: 2.575.100
  2011: 2.665.100
  2012: 2.720.800
  2013: 2.771.420
  2014: 2.768.700
  2015: 2.890.000
  2016: 2.963.800
  2017: 3.010.790
  2018: 3.086.100
  2019: 3.097.107
  2020: 3.177.400
  2021: 3.169.100
  2022: 3.255.810
  2023: (nguồn không có số → không điền)

- Thống kê dân số tổng hợp (mốc 2019 – Đồng Nai cũ)
  Dân số: 3.097.107 người
  Mật độ dân số: 516,3 người/km²
  Dân số thành thị: 48,4%
  Dân số nông thôn: 51,6%
  Ghi chú xếp hạng/so sánh vùng: giữ nguyên dạng mô tả (không dùng để suy luận số liệu khác).

- Thành phần dân tộc (mốc 01/04/2009 – Đồng Nai cũ)
  Tổng số: 51 dân tộc (kèm người nước ngoài)
  Một số nhóm chính (theo nguồn):
  Kinh: 2.311.315
  Hoa: 95.162
  Nùng: 19.076
  Tày: 15.906
  Khmer: 7.059
  “Ít nhất là Si La và Ơ Đu chỉ có một người” (ghi nhận như mô tả nguồn).

- Đô thị hoá (mốc 2022 – Đồng Nai cũ)
  Tỷ lệ đô thị hoá: hơn 45%

- Tôn giáo (Đồng Nai cũ – mốc 01/04/2019)
  Tổng cộng: 13 tôn giáo
  Một số tôn giáo và số tín đồ (theo nguồn):
  Công giáo: 1.015.315
  Phật giáo: 440.556
  Cao Đài: 34.670
  Tin Lành: 43.690
  Hồi giáo: 6.220
  Phật giáo Hòa Hảo: 5.220
  Tịnh độ cư sĩ Phật hội Việt Nam: 530
  Tứ Ân Hiếu Nghĩa: 36
  Minh Sư Đạo: 39
  Bahá'í: 63
  Bà-la-môn: 15
  Minh Lý Đạo: 12
  Bửu Sơn Kỳ Hương: 2
  Mô tả bối cảnh lịch sử hình thành: giữ dạng định tính, không suy luận thêm.

---

## X) GIAO THÔNG & HẠ TẦNG (KHUNG NỘI DUNG)
- Tổng quan hạ tầng giao thông (định tính + điểm nhấn)
  Đồng Nai có mạng lưới giao thông thuận lợi, có nhiều tuyến huyết mạch đi qua:
  Quốc lộ 1, 20, 51
  Tuyến đường sắt Bắc – Nam
  Vị trí liên kết vùng:
  Gần cảng Sài Gòn, gần sân bay quốc tế Tân Sơn Nhất (theo nguồn).
  Đóng vai trò kết nối vùng Đông Nam Bộ với Tây Nguyên.
  Các dự án lớn “đi qua Đồng Nai” được nêu:
  Đường sắt cao tốc Bắc – Nam
  Cao tốc Bắc – Nam
  Cao tốc Biên Hòa – Vũng Tàu
  Vành đai 3 vùng đô thị TP.HCM

- Đường sắt
  Tuyến đường sắt Bắc – Nam đi qua địa bàn dài 87,5 km với 8 ga:
  Biên Hòa, Hố Nai, Trảng Bom, Dầu Giây, Long Khánh, Bảo Chánh, Gia Ray, Trảng Táo
  Vai trò: trục giao thông quan trọng nối các tỉnh phía Bắc với TP.HCM (mô tả theo nguồn).
- Hàng không
  Cảng hàng không quốc tế Long Thành: được mô tả là cửa ngõ hàng không cho khu vực Đông Nam Á và thế giới (theo nguồn).

- Đường thủy – hệ thống cảng
  Trên địa bàn có 3 khu cảng:
  Khu cảng trên sông Đồng Nai
  Cảng Đồng Nai
  Cảng SCTGAS-VN
  Cảng VTGAS (hàng lỏng, tàu 1000 DWT)
  Cảng tổng hợp Phú Hữu II
  Cảng khu vực Tam Phước, Tam An
  Khu cảng trên sông Nhà Bè – Lòng Tàu
  Cảng gỗ mảnh Phú Đông
  Cảng xăng dầu Phước Khánh
  Cảng nhà máy đóng tàu 76
  Cảng tổng hợp Phú Hữu 1
  Cảng CCN VLXD Nhơn Trạch
  Cảng nhà máy dầu nhờn Trâm Anh
  Cảng VIKOWOCHIMEX
  Cảng Sun Steel – China Himent
  Và các cảng chuyên dùng khác
  Khu cảng trên sông Thị Vải
  Cảng Phước An, Phước Thái
  Cảng Gò Dầu A, Gò Dầu B
  Cảng Super Phosphat Long Thành
  Cảng nhà máy Unique Gas


- Các tuyến quốc lộ (danh mục + số liệu chiều dài theo nguồn)

  - Quốc lộ 13
    Chiều dài trên địa bàn: 149,5 km (Km 0 → Km 140+500 theo nguồn)
    Mô tả hướng tuyến: Nam–Bắc, đi qua khu vực Bình Dương cũ, Bình Phước cũ, tới cửa khẩu Hoa Lư và kết nối sang Campuchia/Lào (theo nguồn).
  - Quốc lộ 1
    Chiều dài trên địa bàn: 102 km (Km 1770 → Km 1802 theo nguồn)
    Nguồn mô tả đoạn qua các địa phương cấp huyện/thành phố (hệ cũ) kèm chiều dài từng đoạn.
  - Quốc lộ 51
    Chiều dài trên địa bàn: 38 km (Km 0 → Km 38 theo nguồn)
  - Quốc lộ 20
    Chiều dài trên địa bàn: 75 km (Km 0 → Km 75 theo nguồn)
  - Quốc lộ 56
    Chiều dài trên địa bàn: 18 km (Km 0 → Km 18 theo nguồn; ký hiệu có lỗi ngoặc trong bản copy)

- Biển số xe (chỉ để tham khảo – có mốc cảnh báo)
  Danh sách biển số theo các địa phương (hệ cũ) gồm:
    - Nhóm Bình Phước cũ: Đồng Xoài (93-P1), Bình Long (93-E1), Phước Long (93-K1), Bù Đăng (93-L1), Bù Đốp (93-G1), Bù Gia Mập (93-H1), Chơn Thành (93-B1), Đồng Phú (93-M1), Hớn Quản (93-C1), Lộc Ninh (93-N1 & 93-F1), Phú Riềng (93-Y1)
    - Nhóm Đồng Nai cũ: Biên Hòa (60-AA / 60-B1… và 39-F1… theo nguồn), Long Khánh (60-AB; 60-B2), Tân Phú (60-AC; 60-B3), Định Quán (60-AD; 60-B4; 60-H6), Xuân Lộc (60-AE; 60-B5-H5), Cẩm Mỹ (60-AF; 60-B6), Thống Nhất (60-AH; 60-B7), Trảng Bom (60-AK; 60-B8-H1), Vĩnh Cửu (60-AL; 60-B9), Long Thành (60-AM; 60-C1-G1), Nhơn Trạch (60-AN; 60-C2)
    - Cảnh báo bắt buộc (giữ nguyên tinh thần nội quy):
    “Chỉ để tham khảo” vì sau 01/07/2025 đã bãi bỏ cấp Quận/Huyện/Thành phố thuộc tỉnh (theo mô hình SmartMap).
---

## XI) DU LỊCH – VĂN HÓA – THIÊN NHIÊN (KHUNG NỘI DUNG)
- Văn hoá (mô tả định tính – không có số liệu bắt buộc)
  Đồng Nai (cùng Bình Dương) có nghề gốm sứ truyền thống.
  Đặc trưng mô tả trong nguồn: tạo hoa văn kết hợp khắc nét chìm + trổ thủng, sau đó quét men.
  Một số nghề thủ công truyền thống được nhắc:
  Đan lát, mây tre lá (gắn với rừng lá buông)
  Bánh đa, hủ tíu, gò thùng thiếc (làng Kim Bích)
  Gia công mỹ nghệ, sản phẩm từ gỗ, chế biến nông sản, gạch ngói, đúc đồng, đúc gang…
  Định hướng bảo tồn (theo nguồn): lập cụm công nghiệp nghề truyền thống, mở lớp đào tạo nghề để giữ nghề trước đô thị hoá/hội nhập.


- Du lịch (danh mục điểm đến – đồng thời nhắc đây là “Đồng Nai cũ”)
  Khu du lịch Bửu Long (phường Bửu Long, Biên Hòa; cách trung tâm ~6km)
  Văn miếu Trấn Biên (Biên Hòa)
  Đền thờ Nguyễn Hữu Cảnh
  KDL ven sông Đồng Nai
  Vườn quốc gia Nam Cát Tiên
  Làng bưởi Tân Triều
  KDL sinh thái Thác Mai – hồ nước nóng
  Đảo Ó
  Chiến khu Đ
  Mộ cổ Hàng Gòn
  Đàn đá Bình Đa
  Thác Giang Điền (Trảng Bom)
  Long Châu Viên (Xuân Tân, Long Khánh)
  KDL Vườn Xoài
  Núi Chứa Chan (núi Gia Lào)
  Hồ Núi Le (Xuân Lộc)
  Trung tâm hành hương Đức Mẹ núi Cúi (Gia Kiệm)
  KDL Suối Mơ
  Làng du lịch Tre Việt
  KDL Bò Cạp Vàng
  KDL sinh thái Thủy Châu

- Công trình kiến trúc (bảng “cao nhất theo thời kỳ” – chỉ dùng khi hỏi đúng nội dung kiến trúc/tòa nhà)
  2018–nay: The Mira Central Park — 96m — Biên Hòa (phường Tân Tiến)
  2012–2018: Tòa nhà Sonadezi — 91m — Biên Hòa (phường An Bình)
  2013–nay: Pegasus Plaza — 86m — Biên Hòa (phường Quyết Thắng)
  2011–2012: Long Thành Plaza — 74m — (Long Thành / thị trấn Long Thành)
  2009–2011: Aurora Hotel Plaza — 47m — Biên Hòa (phường Tân Mai)
  1989–2009: Tháp chuông nhà thờ Bùi Chu — 25m — (Trảng Bom / xã Bắc Sơn)
  1967–1989: Tháp nước Biên Hòa — 20m — Biên Hòa (phường Thống Nhất)
  1837–1967: Thành Biên Hòa — 3,6m — Biên Hòa (phường Quang Vinh)

- Kết nghĩa (danh sách – không suy luận thêm)
  Việt Nam: tỉnh Hà Nam
  Lào: tỉnh Champasak
  Hàn Quốc: tỉnh Gyeongsangnam-do
---

## XIII) LỊCH SỬ
- Cư dân sớm (niên đại tiền sử)
- Nam tiến – các mốc hành chính cổ/triều Nguyễn
-  Pháp thuộc
- Sau 1975 → 2019 (các mốc điều chỉnh địa giới)
- Mốc quan trọng cho mô hình của bạn: 12/06/2025 – NQ 202/2025/QH15; sau sáp nhập diện tích 12.737,18 km², dân số 4.491.408.

## XIII) NGUYÊN TẮC CHUNG KHI TRẢ LỜI CÂU HỎI CÓ SỐ LIỆU

1. Luôn xác định số liệu thuộc giai đoạn nào (trước/sau khi hình thành Đồng Nai mới).
2. Nếu là số liệu tham khảo theo giai đoạn trước, phải nói rõ bối cảnh.
3. Nếu không có số liệu đáng tin cậy trong tài liệu nội bộ / JSON:
   - Bắt buộc dùng mẫu “chưa có số liệu cập nhật” (mục I).
---
