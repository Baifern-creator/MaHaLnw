# GLORY Photobooth V3

เปิดโฟลเดอร์นี้ใน VS Code และเปิด `index.html` ด้วย Live Server (localhost) เพื่อใช้งานกล้อง

## ลำดับ
หน้าแรก (โหลดอัตโนมัติ) → LET'S GLOW !! → แบบสอบถามแบตเตอรี่ผิว (0,25,50,75,100%) → ผลลัพธ์ → กล้องถ่ายรูป 3 ครั้ง → ดาวน์โหลด PNG

## Frame
ใช้เฟรมเดียว: `assets/frames/glory-original.png` (910×2048 pixels)
ช่องภาพวัดจาก PNG จริง: (114,106,682,443), (114,596,682,443), (114,1085,682,443) โดยรูปแบบ (x,y,width,height) หน่วย px

หน้า Photobooth ไม่มีปุ่ม NEXT แล้ว และยังคงปุ่ม ENABLE CAMERA / TAKE PHOTOS / DOWNLOAD / RETAKE

การตกแต่งหัวข้อ UR GLOWY BUDDY เป็นตัวอักษรบนวงกลมด้วย CSS ในเวอร์ชันนี้ หากมีไฟล์ PNG ของสติกเกอร์หัวข้อจริง ส่งมาเพื่อแทนที่ได้


GLORY V4: ใช้ frame_glory(3).png ตามต้นฉบับทุกพิกเซล รวมแว่นกันแดดสีดำและสติกเกอร์ทุกชิ้น โดยซ้อนเฟรมทับรูปทั้ง 3 ช่อง (910 x 2048 px)


CUSTOM POPUPS (Illustrator):
- Slider question (0/25/50/75/100) → custom WARNING → custom NEO SKIN MAX → photobooth.
- Assets: popup-warning.png, popup-buddy.png, popup-next.png, popup-photobooth.png.
- The original frame and camera/photo capture logic remain unchanged.
- Open with VS Code Live Server; allow camera permission.


## Latest adjustments
- After LET'S GLOW, the WARNING Illustrator pop-up opens immediately. The previous skin-battery questionnaire was removed.
- NEXT opens the NEO SKIN MAX pop-up; GO TO PHOTOBOOTH opens the camera page.
- Pop-ups are now capped at 540px wide on desktop and scale down on phones.
- Restored the PHOTObooth sticker to the upper-left corner of the landing page using `assets/camera-homepage.png`.


### Pop-up sizing update
Both Illustrator pop-ups display at a maximum width of 420px. Buttons are positioned at the bottom center, sized 31% (NEXT) and 54% (GO TO PHOTOBOOTH) of the artwork width, 7.5% from the bottom. Change `.custom-popup` width in style.css if desired.
