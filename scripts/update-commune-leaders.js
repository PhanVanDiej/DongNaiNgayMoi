// scripts/update-commune-leaders.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Gốc project: scripts/.. → root
const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT_DIR, "server", "data");
const COMMUNE_DIR = path.join(DATA_DIR, "communes");
const COMMUNE_INDEX_PATH = path.join(DATA_DIR, "communes.index.json");

// Danh sách: code, name, partySecretary, chairman
const LEADERS_CSV = `
26068, Phường Biên Hòa, Viên Hồng Tiến, Thái Thanh Phong
26041, Phường Trấn Biên, Hồ Văn Nam, Nguyễn Duy Tân
26017, Phường Tam Hiệp, Nguyễn Xuân Thanh, Lê Kim Hường
26020, Phường Long Bình, Nguyễn Thị Thu Hiền, Hồ Sỹ Tiến
25993, Phường Trảng Dài, Phan Quang Tuấn, Nguyễn Đình Kiên
26005, Phường Hố Nai, Nguyễn Quốc Vũ, Cao Duy Thái
26380, Phường Long Hưng, Nguyễn Thị Như Ý, Phan Huy Toàn
26491, Xã Đại Phước, Nguyễn Thế Phong, Hồ Quốc Tân
26485, Xã Nhơn Trạch, Từ Nam Thành, Lư Thành Nam
26503, Xã Phước An, Đỗ Huy Khánh, Huỳnh Minh Đức
26422, Xã Phước Thái, Huỳnh Minh Dũng, Vũ Quốc Việt
26413, Xã Long Phước, Dương Thị Mỹ Châu, Trần Văn Thân
26389, Xã Bình An, Huỳnh Phước Sang, Trương Quốc Phong
26368, Xã Long Thành, Dương Minh Dũng, Lê Hoàng Sơn
26383, Xã An Phước, Trần Thế Vinh, Đoàn Minh Trí
26296, Xã An Viễn, Vũ Đình Trung, Nguyễn Quốc Tần
26278, Xã Bình Minh, Nguyễn Kim Phước, Trần Đức Hòa
26248, Xã Trảng Bom, Đặng Doãn Thành, Lê Ngọc Tiên
26254, Xã Bàu Hàm, Lê Huy Thiêm, Nguyễn Đức Can
26281, Xã Hưng Thịnh, Đỗ Ngọc Nam, Lê Mạnh Hùng
26326, Xã Dầu Giây, Cao Tiến Sỹ, Mai Văn Hiền
26311, Xã Gia Kiệm, Nguyễn Huy Du, La Nguyễn Minh Hiền
26299, Xã Thống Nhất, Trịnh Văn Trường, Phạm Hồng Đông
26089, Phường Bình Lộc, Nguyễn Xuân Hà, Đào Đại Giang
26098, Phường Bảo Vinh, Nguyễn Bích Thủy, Bùi Quốc Thể
26104, Phường Xuân Lập, Nguyễn Trung Tín, Trần Vĩnh Hiền
26080, Phường Long Khánh, Đặng Minh Nguyệt, Tăng Quốc Lập
26113, Phường Hàng Gòn, Nông Thanh Tuấn, Hoàng Trọng Phương
26332, Xã Xuân Quế, Lê Văn Tưởng, Lê Văn Bình
26347, Xã Xuân Đường, Lê Hồng Cường, Bùi Văn Thọ
26341, Xã Cẩm Mỹ, Đỗ Khôi Nguyên, Nguyễn Đại Thắng
26362, Xã Sông Ray, Lưu Văn Sửu, Phan Tấn Tài
26359, Xã Xuân Đông, Phan Trung Hưng Hà, Trần Văn Thức
26461, Xã Xuân Định, Tống Trần Hòa, Lê Thị Hiệp
26458, Xã Xuân Phú, Lại Thế Thông, Nguyễn Văn Linh
26425, Xã Xuân Lộc, Nguyễn Thị Cát Tiên, Lê Khắc Sơn
26446, Xã Xuân Hòa, Tạ Quang Trường, Lê Văn Nam
26434, Xã Xuân Thành, Lâm Hữu Tú, Nguyễn Thị Thùy Linh
26428, Xã Xuân Bắc, Trần Lâm Sinh, Nguyễn Bảo Khang
26227, Xã La Ngà, Trần Hữu Hạnh, Thái Bình Dương
26206, Xã Định Quán, Nguyễn Cao Cường, Hồ Thanh Trúc
26215, Xã Phú Vinh, Đào Văn Tuấn, Lê Triết Như Vũ
26221, Xã Phú Hòa, Trần Nam Biên, Nguyễn Văn Viện
26134, Xã Tà Lài, Trịnh Văn Luận, Nguyễn Hùng Hải
26122, Xã Nam Cát Tiên, Võ Hoàng Phương, Trương Hồng Phúc
26116, Xã Tân Phú, Trần Quang Tú, Phạm Ngọc Hưng
26158, Xã Phú Lâm, Nguyễn Hữu Ký, Phạm Thanh Hải
26170, Xã Trị An, Nguyễn Thanh Tú, Nguyễn Thị Dung
26179, Xã Tân An, Lê Đỗ Kim Chi, Lê Anh Tuấn
26188, Phường Tân Triều, Nguyễn Quang Phương, Lê Nguyễn Song Toàn
25441, Phường Minh Hưng, Lê Tiến Hiếu, Lê Khắc Đồng
25432, Phường Chơn Thành, Nguyễn Minh Bình, Nguyễn Anh Tài
25450, Xã Nha Bích, Nguyễn Trung Dũng, Nguyễn Hồng Thái
25351, Xã Tân Quan, Nguyễn Văn Thư, Nguyễn Hồ Nam
25345, Xã Tân Hưng, Mạc Đình Huấn, Nguyễn Vũ Tiến
25357, Xã Tân Khai, Quách Thị Ánh, Nguyễn Tín Nghĩa
25349, Xã Minh Đức, Trần Văn Phương, Huỳnh Văn Minh
25326, Phường Bình Long, Bùi Quốc Bảo, Đặng Hoàng Thái
25333, Phường An Lộc, Đỗ Minh Trung, Trần Thanh Long
25280, Xã Lộc Thạnh, Trần Hoàng Trực, Nguyễn Văn Thảo
25294, Xã Lộc Thành, Nguyễn Ngọc Hiền, Hồ Quang Khánh
25270, Xã Lộc Ninh, Nguyễn Gia Hòa, Nguyễn Thị Nghĩa
25303, Xã Lộc Hưng, Lý Thanh Tâm, Nguyễn Thị Xuân Linh
25279, Xã Lộc Tấn, Hoàng Mạnh Thường, Nguyễn Mạnh Dũng
25292, Xã Lộc Quang, Trần Đức Thịnh, Võ Văn Lượng
25318, Xã Tân Tiến, Nguyễn Thị Hoài Thanh, Văn Công Danh
25308, Xã Thiện Hưng, Đặng Hà Giang, Nguyễn Minh Phong
25309, Xã Hưng Phước, Trịnh Tiến Tâm, Nguyễn Công Danh
25267, Xã Phú Nghĩa, Lê Thành Long, Lại Thế Hòa
25231, Xã Đa Kia, Lý Trọng Nhân, Đặng Hữu Khoái
25220, Phường Phước Bình, Huỳnh Thị Thùy Trang, Nguyễn Văn Dũng
25217, Phường Phước Long, Nguyễn Thị Hương Giang, Nguyễn Khắc Hạnh
25246, Xã Bình Tân, Nguyễn Bá Việt, Doãn Thị Xuân Mai
25255, Xã Long Hà, Lê Anh Nam, Phạm Hồng Công
25252, Xã Phú Riềng, Nguyễn Thị Xuân Hòa, Nguyễn Danh Tùng
25261, Xã Phú Trung, Phạm Kim Trọng, Lê Văn Chung
25210, Phường Đồng Xoài, Vũ Văn Mười, Dương Hoài Pha
25195, Phường Bình Phước, Giang Thị Phương Hạnh, Ngô Hồng Khang
25387, Xã Thuận Lợi, Bùi Thị Minh Thúy, Hoa Vận Định
25390, Xã Đồng Tâm, Đinh Văn Kỹ, Nguyễn Thanh Phương
25378, Xã Tân Lợi, Dương Thanh Huân, Lê Văn Trân
25363, Xã Đồng Phú, Nguyễn Tấn Hùng, Hồ Hùng Phi
25420, Xã Phước Sơn, Nguyễn Thế Hải, Trần Ngọc Công
25417, Xã Nghĩa Trung, Võ Thị Anh Đào, Nguyễn Văn Lưu
25396, Xã Bù Đăng, Vũ Lương, Nguyễn Thanh Tùng
25402, Xã Thọ Sơn, Lê Thanh Hải, Trần Văn Phương
25399, Xã Đak Nhau, Nguyễn Trọng Lâm
25405, Xã Bom Bo, Tô Hoài Nam
26374, Phường Tam Phước, Nguyễn Thị Phương, Vũ Quốc Thái
26377, Phường Phước Tân, Nguyễn Phong An, Thiều Thị Minh Hường
26209, Xã Thanh Sơn, Ngô Hoàng Hải, Võ Văn Trung
26119, Xã Đak Lua, Phan Văn Tùng, Nguyễn Thanh Hiền
26173, Xã Phú Lý, Nguyễn Thanh Tuyền, Nguyễn Thị Thanh Phương
25222, Xã Bù Gia Mập, Lê Hoàng Nam, Trần Lâm
25225, Xã Đăk Ơ, Phùng Hiệp Quốc, Nguyễn Tấn Lực
`.trim();

/**
 * Chuẩn hóa chuỗi: trim và gộp nhiều khoảng trắng thành 1
 */
function normalizeText(str) {
  return str.replace(/\s+/g, " ").trim();
}

/**
 * Parse CSV leadership → mảng:
 * { code, name, partySecretary, chairman }
 */
function parseLeaders(csv) {
  const lines = csv
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const result = [];

  for (const line of lines) {
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length < 3) {
      console.warn("Bỏ qua dòng (ít hơn 3 cột):", line);
      continue;
    }

    const code = parts[0];
    const name = parts[1];
    const partySecretary = parts[2] || "";
    // Có dòng thiếu chủ tịch → nếu không có thì để "Đang cập nhật"
    const chairman = parts[3] && parts[3].length > 0 ? parts[3] : "Đang cập nhật";

    result.push({
      code: normalizeText(code),
      name: normalizeText(name),
      partySecretary: normalizeText(partySecretary),
      chairman: normalizeText(chairman),
    });
  }

  return result;
}

async function main() {
  console.log("Đọc communes.index.json từ:", COMMUNE_INDEX_PATH);
  const indexRaw = await fs.readFile(COMMUNE_INDEX_PATH, "utf8");
  const communesIndex = JSON.parse(indexRaw);

  // Tạo map code → id (cẩn thận xa-loc-thanh vs xa-loc-thanhh)
  const codeToId = {};
  for (const communeKey of Object.keys(communesIndex)) {
    const commune = communesIndex[communeKey];
    const code = String(commune.code).trim();
    if (!code) continue;
    if (codeToId[code]) {
      console.warn(
        `Cảnh báo: trùng code ${code} cho id ${commune.id} và ${codeToId[code]}`
      );
    }
    codeToId[code] = commune.id;
  }

  const leadersList = parseLeaders(LEADERS_CSV);
  console.log(`Tổng số dòng leaders: ${leadersList.length}`);

  let updatedCount = 0;
  let missingIndexCount = 0;
  let missingFileCount = 0;

  for (const leader of leadersList) {
    const { code, name, partySecretary, chairman } = leader;
    const id = codeToId[code];

    if (!id) {
      console.warn(
        `Không tìm thấy id trong communes.index cho code=${code}, name="${name}"`
      );
      missingIndexCount++;
      continue;
    }

    const filePath = path.join(COMMUNE_DIR, `${id}.json`);

    let communeData;
    try {
      const raw = await fs.readFile(filePath, "utf8");
      communeData = JSON.parse(raw);
    } catch (err) {
      if (err.code === "ENOENT") {
        console.warn(`Không tìm thấy file commune: ${filePath}`);
        missingFileCount++;
        continue;
      }
      console.error(`Lỗi đọc/parsing file ${filePath}:`, err);
      continue;
    }

    if (!communeData.leaders || typeof communeData.leaders !== "object") {
      communeData.leaders = {};
    }

    communeData.leaders.partySecretary = partySecretary;
    communeData.leaders.chairman = chairman;

    // Ghi lại file với format đẹp
    await fs.writeFile(filePath, JSON.stringify(communeData, null, 2), "utf8");
    updatedCount++;
    console.log(
      `✔ Cập nhật ${id} (${code}) – Bí thư: ${partySecretary}, Chủ tịch: ${chairman}`
    );
  }

  console.log("==== KẾT THÚC ====");
  console.log("Đã cập nhật:", updatedCount);
  console.log("Không tìm thấy trong index:", missingIndexCount);
  console.log("Không tìm thấy file JSON:", missingFileCount);
}

main().catch((err) => {
  console.error("Có lỗi xảy ra:", err);
  process.exit(1);
});
