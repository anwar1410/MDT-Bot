const Jimp = require('jimp');

/**
 * Generate a police department table image for up to 10 soldiers.
 * @param {Array} soldiers - Array of objects: { code, name, status } where status is 'login', 'logout', or 'end_shift'.
 * @returns {Promise<Buffer>} - PNG image buffer
 */
async function generatePoliceTableImage(soldiers) {
  // إعدادات الصورة
  const width = 700, rowHeight = 54, headerHeight = 70, maxRows = 10;
  const count = soldiers.length;
  const height = headerHeight + Math.max(count, 1) * rowHeight + 20;

  // إنشاء صورة Jimp
  const image = new Jimp(width, height, '#181c20');
  
  // تحميل الخطوط
  const titleFont = await Jimp.loadFont(Jimp.FONT_SANS_24_BLACK);
  const headerFont = await Jimp.loadFont(Jimp.FONT_SANS_18_BLACK);
  const textFont = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
  const boldFont = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);

  // العنوان
  image.print(titleFont, 30, 20, 'Police Department');

  // دائرة عدد المباشرين
  const directCount = soldiers.filter(s => s.status === 'login').length;
  
  // إنشاء دائرة خضراء
  const circleSize = 56;
  const circle = new Jimp(circleSize, circleSize, 0x00000000);
  for (let x = 0; x < circleSize; x++) {
    for (let y = 0; y < circleSize; y++) {
      const distance = Math.sqrt((x - circleSize/2) ** 2 + (y - circleSize/2) ** 2);
      if (distance <= circleSize/2) {
        circle.setPixelColor(0xFF27AE60, x, y); // أخضر
      }
    }
  }
  image.composite(circle, width - 60 - circleSize/2, 38 - circleSize/2);
  
  // رقم المباشرين في الدائرة
  image.print(boldFont, width - 60 - 10, 38 - 8, directCount.toString());

  // رؤوس الأعمدة
  image.print(headerFont, 30, headerHeight - 20, 'الحالة');
  image.print(headerFont, 100, headerHeight - 20, 'الكود');
  image.print(headerFont, 200, headerHeight - 20, 'الاسم');

  // الصفوف
  for (let i = 0; i < Math.max(count, 1); i++) {
    const y = headerHeight + 10 + i * rowHeight;
    
    // خلفية الصف
    const rowColor = i % 2 === 0 ? '#23272b' : '#202326';
    const rowBackground = new Jimp(width - 40, rowHeight - 4, rowColor);
    image.composite(rowBackground, 20, y - 8);

    if (i >= count) continue;
    const s = soldiers[i];
    
    // دائرة الحالة
    let statusColor = 0xFF636E72; // رمادي
    if (s.status === 'login') statusColor = 0xFF27AE60; // أخضر
    else if (s.status === 'logout') statusColor = 0xFFE74C3C; // أحمر
    
    const statusCircleSize = 28;
    const statusCircle = new Jimp(statusCircleSize, statusCircleSize, 0x00000000);
    for (let x = 0; x < statusCircleSize; x++) {
      for (let y2 = 0; y2 < statusCircleSize; y2++) {
        const distance = Math.sqrt((x - statusCircleSize/2) ** 2 + (y2 - statusCircleSize/2) ** 2);
        if (distance <= statusCircleSize/2) {
          statusCircle.setPixelColor(statusColor, x, y2);
        }
      }
    }
    image.composite(statusCircle, 50 - statusCircleSize/2, y + rowHeight/2 - 10 - statusCircleSize/2);
    
    // الكود
    image.print(boldFont, 85, y + rowHeight/2 - 8, s.code);
    
    // الاسم
    image.print(textFont, 170, y + rowHeight/2 - 8, s.name);
  }

  return await image.getBufferAsync(Jimp.MIME_PNG);
}

module.exports = { generatePoliceTableImage }; 