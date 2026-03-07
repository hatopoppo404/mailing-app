'use strict';

// ----------------------------------------------------------------
const select = document.getElementById('template-select');
const trigger = select.querySelector('.select-trigger');
const options = select.querySelectorAll('.option');
const addressList = document.getElementById('address-options');
const addAddressBtn = document.getElementById('add-address-btn');
const checkboxes = document.querySelectorAll('.option-item input[type="checkbox"]');
const countDisplay = document.getElementById('selected-count'); // 件数を表示する要素（HTMLに作ってね）
const tableBody = document.getElementById('selected-table-body');
const tableContainer = document.getElementById('table-container');

// 1. クリックで開閉
trigger.addEventListener('click', () => {
    select.classList.toggle('open');
});
addAddressBtn.addEventListener('click', () => {
    addressList.classList.toggle('open');
    tableContainer.classList.add('is-fixed');
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

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        // チェックがついているものだけを数える
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        if (countDisplay) countDisplay.textContent = checkedCount;

        // テーブルを更新
        tableBody.innerHTML = '';
        const checkedItems = Array.from(checkboxes).filter(cb => cb.checked);
        checkedItems.forEach(cb => {
            const label = cb.closest('.option-item').querySelector('label').textContent;
            const row = document.createElement('tr');
            const checkboxId = cb.id;

            row.innerHTML = `
                <td>${label}</td>
                <td>
                    <button class="remove-selected">
                        <svg data-target="${checkboxId}" class="icon-backspace" viewBox="0 0 48 36">
                            <path
                                d="M36 12L24 24M24 12L36 24M42 2H16L2 18L16 34H42C43.0609 34 44.0783 33.5786 44.8284 32.8284C45.5786 32.0783 46 31.0609 46 30V6C46 4.93913 45.5786 3.92172 44.8284 3.17157C44.0783 2.42143 43.0609 2 42 2Z" />
                        </svg></button>
                </td>
            `;
            tableBody.appendChild(row);
        });


    });
});

tableBody.addEventListener('click', (e) => {
    // クリックされた要素から、一番近い「削除ボタン」を探す
    const btn = e.target.closest('.remove-selected');
    if (!btn) return;

    // SVGまたはボタンに仕込んだ data-target を取得
    // ※ e.target.closest でボタンを取得してから、その中の要素や自分自身のデータを見る
    const targetId = btn.querySelector('svg').dataset.target;
    const targetCheckbox = document.getElementById(targetId);

    if (targetCheckbox) {
        targetCheckbox.checked = false; // チェックを外す
        targetCheckbox.dispatchEvent(new Event('change')); // 再描画を連鎖させる！
    }
});



// 3. 外側をクリックしたら閉じる
window.addEventListener('click', (e) => {
    // 【1つ目のセレクトボックス用】
    // クリックされたのが「本体」でも「ボタン」でもない時だけ閉じる
    if (!select.contains(e.target) && !trigger.contains(e.target)) {
        select.classList.remove('open');
    }

    // 【2つ目のアドレスリスト用】
    // クリックされたのが「本体」でも「ボタン」でもない時だけ閉じる
    if (!addressList.contains(e.target) && !addAddressBtn.contains(e.target)) {
        addressList.classList.remove('open');
        tableContainer.classList.remove('is-fixed');
    }
});
// ----------------------------------------------------------------

// ----------------------------------------------------------------




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