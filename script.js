'use strict';

const select = document.getElementById('template-select');
const trigger = select.querySelector('.select-trigger');
const options = select.querySelectorAll('.option');

// 1. クリックで開閉
trigger.addEventListener('click', () => {
    select.classList.toggle('open');
});

// 2. 選択肢を選んだ時の処理
options.forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation(); // ★これ！「親へのイベント伝達」を止める魔法

        const value = option.getAttribute('data-value');
        const text = option.textContent;

        document.getElementById('selected-text').textContent = text;

        // 小窓を閉じる
        select.classList.remove('open');
    });
});

const multiSelect = document.getElementById('multi-select');
const checkboxes = multiSelect.querySelectorAll('.item-checkbox');
const displayText = document.getElementById('multi-selected-text');

// チェックの状態が変わるたびに実行
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        // 1. チェックされている数を数える
        const checkedCount = multiSelect.querySelectorAll('.item-checkbox:checked').length;

        // 2. 表示を更新する
        displayText.textContent = `${checkedCount}個 選択中`;

        // ここで「小窓を閉じる」処理は書かない！（連続でチェックしたいから）
    });
});

// 3. 外側をクリックしたら閉じる（親切設計！）
window.addEventListener('click', (e) => {
    if (!select.contains(e.target)) {
        select.classList.remove('open');
    }
});
// Quillの初期化
const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'clean']
        ]
    }
});

// ここに今後、本文監視やDB連携のJSを書いていくよ！

const db = new Dexie("MailAppDB");

db.version(1).stores({
    templates: '++id, to, subject, body, createdAt'
});


// document.getElementById('downloadBtn').onclick = () => {
//     // 1. データの準備（本来はフォームやエディタから取得する部分）
//     const to = "recipient@example.com";
//     const subject = "【テスト】HTMLメールの送信";
//     const htmlBody = `
//                 <html>
//                     <body>
//                         <h1 style="color: #2c3e50;">こんにちは！</h1>
//                         <p>これはJSから生成された<b>HTMLメール</b>です。</p>
//                         <p style="background: #ecf0f1; padding: 10px;">
//                             装飾も反映されているはずだよ！✨
//                         </p>
//                     </body>
//                 </html>
//             `;

//     // 2. EML形式の組み立て（魔法のヘッダー X-Unsent: 1 を追加）
//     const emlContent = [
//         `To: ${to}`,
//         `Subject: ${subject}`,
//         `X-Unsent: 1`, // これが重要！
//         `Content-Type: text/html; charset="utf-8"`,
//         `MIME-Version: 1.0`,
//         ``, // ヘッダーと本文の間の空行
//         htmlBody
//     ].join('\r\n');

//     // 3. Blob（塊）にしてダウンロード
//     const blob = new Blob([emlContent], { type: 'message/rfc822' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = "test_mail.eml";
//     a.click();
//     URL.revokeObjectURL(url); // メモリ解放
// };