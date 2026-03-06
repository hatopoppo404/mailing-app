'use strict';

const db = new Dexie("MailAppDB");

db.version(1).stores({
    templates: '++id, to, subject, body, createdAt'
});


document.getElementById('downloadBtn').onclick = () => {
    // 1. データの準備（本来はフォームやエディタから取得する部分）
    const to = "recipient@example.com";
    const subject = "【テスト】HTMLメールの送信";
    const htmlBody = `
                <html>
                    <body>
                        <h1 style="color: #2c3e50;">こんにちは！</h1>
                        <p>これはJSから生成された<b>HTMLメール</b>です。</p>
                        <p style="background: #ecf0f1; padding: 10px;">
                            装飾も反映されているはずだよ！✨
                        </p>
                    </body>
                </html>
            `;

    // 2. EML形式の組み立て（魔法のヘッダー X-Unsent: 1 を追加）
    const emlContent = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `X-Unsent: 1`, // これが重要！
        `Content-Type: text/html; charset="utf-8"`,
        `MIME-Version: 1.0`,
        ``, // ヘッダーと本文の間の空行
        htmlBody
    ].join('\r\n');

    // 3. Blob（塊）にしてダウンロード
    const blob = new Blob([emlContent], { type: 'message/rfc822' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "test_mail.eml";
    a.click();
    URL.revokeObjectURL(url); // メモリ解放
};