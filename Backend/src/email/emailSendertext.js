const generateEmailConfirmationHTML = (FirstName, ConfirmationLink, color) => `
<html>
  <body style="margin: 0; padding: 0; background-color: #e0f7ff; font-family: 'Comic Sans MS', 'Arial', sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #e0f7ff; width: 100%; padding: 40px 0;">
      <tr>
        <td align="center">
          <!-- Outer Container -->
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background: #ffffff; border-radius: 16px; box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15); overflow: hidden;">
            <!-- Game Banner Header -->
            <tr>
              <td style="background-color: ${color}; padding: 20px; text-align: center;">
                <h1 style="color: white; font-size: 28px; margin: 0;">🎮 Jumpy Bird Adventure Awaits!</h1>
              </td>
            </tr>
            <!-- Content Body -->
            <tr>
              <td style="padding: 30px;">
                <p style="font-size: 18px; margin: 0;">🗓️ วันที่: ${new Date().toLocaleDateString('th-TH')}</p>
                <p style="margin: 20px 0; font-size: 18px;">สวัสดีคุณ <strong>${FirstName}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6; text-align: center;">
                  ขอบคุณที่ร่วมผจญภัยไปกับนกน้อยจอมกระโดดของเรา!
                  <br/>
                  กรุณากดยืนยันอีเมลของคุณเพื่อเริ่มต้นเกม
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${ConfirmationLink}" style="background-color: ${color}; color: #fff; padding: 14px 30px; border-radius: 10px; font-weight: bold; font-size: 16px; text-decoration: none;">
                    ✅ ยืนยันอีเมลของฉัน
                  </a>
                </div>
                <p style="text-align: center; font-weight: bold; color: #ff0000;">⏰ ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง</p>
                <hr style="margin: 30px 0; border: none; border-top: 2px dashed #ccc;">
                <p style="font-size: 14px; text-align: center;">
                  📞 หากคุณมีคำถามเพิ่มเติม โปรดติดต่อเราที่
                  <a href="mailto:mamduh2542@gmail.com" style="color: ${color}; text-decoration: none;">mamduh2542@gmail.com</a><br/>
                  หรือโทร 093-495-4384
                </p>
                <p style="font-size: 14px; text-align: center; margin-top: 20px;">
                  ด้วยความเคารพ,<br/>ทีมงาน Jumpy Bird<br/>บริษัท Marooooooooooon จำกัด
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const generateResetEmailHTML = (FirstName, ResetLink, color) => `
<html>
  <body style="margin: 0; padding: 0; background-color: #e0f7ff; font-family: 'Comic Sans MS', 'Arial', sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #e0f7ff; width: 100%; padding: 40px 0;">
      <tr>
        <td align="center">
          <!-- Outer Container -->
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background: #ffffff; border-radius: 16px; box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15); overflow: hidden;">
            <!-- Header -->
            <tr>
              <td style="background-color: ${color}; padding: 20px; text-align: center;">
                <h1 style="color: white; font-size: 28px; margin: 0;">🔒 รีเซ็ตรหัสผ่าน Jumpy Bird</h1>
              </td>
            </tr>
            <!-- Content Body -->
            <tr>
              <td style="padding: 30px;">
                <p style="font-size: 18px; margin: 0;">🗓️ วันที่: ${new Date().toLocaleDateString('th-TH')}</p>
                <p style="margin: 20px 0; font-size: 18px;">เรียนคุณ <strong>${FirstName}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6; text-align: center;">
                  ตามที่ท่านได้แจ้งขอเปลี่ยนรหัสผ่านใหม่กับ บริษัท Maroooooooooooon จำกัด กรุณาคลิกที่ลิงก์ด้านล่างเพื่อเปลี่ยนรหัสผ่านของคุณ
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${ResetLink}" style="background-color: ${color}; color: #fff; padding: 14px 30px; border-radius: 10px; font-weight: bold; font-size: 16px; text-decoration: none;">
                    🔑 คลิกที่นี่เพื่อเปลี่ยนรหัสผ่าน
                  </a>
                </div>
                <p style="text-align: center; font-weight: bold; color: #ff0000;">⏰ ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง</p>
                <hr style="margin: 30px 0; border: none; border-top: 2px dashed #ccc;">
                <p style="font-size: 14px; text-align: center;">
                  📞 หากคุณมีคำถามเพิ่มเติม โปรดติดต่อเราที่
                  <a href="mailto:mamduh2542@gmail.com" style="color: ${color}; text-decoration: none;">mamduh2542@gmail.com</a><br/>
                  หรือโทร 093-495-4384
                </p>
                <p style="font-size: 14px; text-align: center; margin-top: 20px;">
                  ด้วยความเคารพ,<br/>บริษัท Maroooooooooooon จำกัด
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const requestOtpEmailHTML = (FirstName, OtpCode, refCode, color) => `
<html>
  <body style="margin: 0; padding: 0; background-color: #e0f7ff; font-family: 'Comic Sans MS', 'Arial', sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #e0f7ff; width: 100%; padding: 40px 0;">
      <tr>
        <td align="center">
          <!-- Outer Container -->
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background: #ffffff; border-radius: 16px; box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15); overflow: hidden;">
            <!-- Header -->
            <tr>
              <td style="background-color: ${color}; padding: 20px; text-align: center;">
                <h1 style="color: white; font-size: 28px; margin: 0;">🔐 รหัสยืนยัน Jumpy Bird</h1>
              </td>
            </tr>
            <!-- Content Body -->
            <tr>
              <td style="padding: 30px;">
                <p style="font-size: 18px; margin: 0;">🗓️ วันที่: ${new Date().toLocaleDateString('th-TH')}</p>
                <p style="margin: 20px 0; font-size: 18px;">เรียนคุณ <strong>${FirstName}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6; text-align: center;">
                  รหัสยืนยันของคุณคือ
                </p>
                <p style="text-align: center; padding: 10px; background-color: ${color}; border-radius: 8px; color: white; font-weight: bold; font-size: 16px;">
                  Ref Code: ${refCode}
                </p>
                <div style="text-align: center; margin: 30px 0; padding: 1px; background-color: #f0f9ff;">
                  <p style="font-size: 3rem; font-weight: 700; margin: 0;">
                    ${OtpCode}
                  </p>
                </div>
                <div style="text-align: center; font-size: 14px; line-height: 1.5;">
                  <p>ป้อนรหัสยืนยันนี้เพื่อดำเนินการต่อ</p>
                  <p>รหัสนี้จะหมดอายุใน 5 นาที</p>
                  <p>หากคุณไม่ได้ร้องขอรหัสนี้ คุณสามารถละเว้นอีเมลนี้ได้อย่างปลอดภัย</p>
                  <p>📞 หากคุณมีคำถามเพิ่มเติม โปรดติดต่อเราที่
                    <a href="mailto:mamduh2542@gmail.com" style="color: ${color}; text-decoration: none;">mamduh2542@gmail.com</a><br/>
                    หรือโทร 093-495-4384
                  </p>
                </div>
                <p style="font-size: 14px; text-align: center; margin-top: 20px;">
                  ด้วยความเคารพ,<br/>บริษัท Maroooooooooooon จำกัด
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;


const requestEnable2FAEmailHTML = (FirstName, ResetLink, color) => `
<html>
  <body style="margin: 0; padding: 0; background-color: #e0f7ff; font-family: 'Comic Sans MS', 'Arial', sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #e0f7ff; width: 100%; padding: 40px 0;">
      <tr>
        <td align="center">
          <!-- Outer Container -->
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background: #ffffff; border-radius: 16px; box-shadow: 0px 6px 12px rgba(0,0,0,0.15); overflow: hidden;">
            <!-- Header -->
            <tr>
              <td style="background-color: ${color}; padding: 20px; text-align: center;">
                <h1 style="color: white; font-size: 28px; margin: 0;">🔐 เปิดใช้งานยืนยันตัวตนแบบสองขั้นตอน (2FA)</h1>
              </td>
            </tr>
            <!-- Content Body (Thai) -->
            <tr>
              <td style="padding: 30px;">
                <p style="font-size: 18px; margin: 0;">🗓️ วันที่: ${new Date().toLocaleDateString('th-TH')}</p>
                <p style="margin: 20px 0; font-size: 18px;">เรียนคุณ <strong>${FirstName}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6; text-align: center;">
                  คุณได้เปิดใช้งานการยืนยันตัวตนแบบสองขั้นตอน (2FA) กับระบบของเราแล้ว
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${ResetLink}" style="background-color: ${color}; color: #fff; padding: 14px 30px; border-radius: 10px; font-weight: bold; font-size: 16px; text-decoration: none;">
                    เปิดใช้งาน 2FA
                  </a>
                </div>
                <hr style="margin: 30px 0; border: none; border-top: 2px dashed #ccc;">
                <p style="font-size: 14px; text-align: center;">
                  📞 หากคุณมีคำถามเพิ่มเติม โปรดติดต่อเราที่
                  <a href="mailto:mamduh2542@gmail.com" style="color: ${color}; text-decoration: none;">mamduh2542@gmail.com</a><br/>
                  หรือโทร 093-495-4384
                </p>
                <p style="font-size: 14px; text-align: center; margin-top: 20px;">
                  ด้วยความเคารพ,<br/>บริษัท Maroooooooooooon จำกัด
                </p>
                <div style="text-align: center; margin-top: 30px;">
                  <img src="cid:logoimg" alt="SmartHub Logo" style="max-width: 150px;">
                </div>
              </td>
            </tr>
            <!-- Content Body (English) -->
            <tr>
              <td style="padding: 30px; border-top: 1px solid #eee;">
                <p style="font-size: 18px; margin: 0;">📅 Date: ${new Date().toLocaleDateString('en-US')}</p>
                <p style="margin: 20px 0; font-size: 18px;">Dear <strong>${FirstName}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6; text-align: center;">
                  You have enabled Two-Factor Authentication (2FA) for your account.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${ResetLink}" style="background-color: ${color}; color: #fff; padding: 14px 30px; border-radius: 10px; font-weight: bold; font-size: 16px; text-decoration: none;">
                    Enable 2FA
                  </a>
                </div>
                <hr style="margin: 30px 0; border: none; border-top: 2px dashed #ccc;">
                <p style="font-size: 14px; text-align: center;">
                  📞 For further information, please contact our Call Center at 093-495-4384 or email
                  <a href="mailto:mamduh2542@gmail.com" style="color: ${color}; text-decoration: none;">mamduh2542@gmail.com</a>
                </p>
                <p style="font-size: 14px; text-align: center; margin-top: 20px;">
                  Sincerely,<br/>Maroooooooooooon Co., Ltd.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

module.exports = {generateEmailConfirmationHTML, generateResetEmailHTML, requestOtpEmailHTML, requestEnable2FAEmailHTML } // Export the function