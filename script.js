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
const saveTemplateBtn = document.getElementById('btn__save-template');
const addressSetsBtn = document.getElementById('btn__directory-edit');
const addressSetWindow = document.getElementById('address-list-edit-Container');

trigger.addEventListener('click', () => {
    select.classList.toggle('open');
});
addAddressBtn.addEventListener('click', () => {
    addressList.classList.toggle('open');
    tableContainer.classList.add('is-fixed');
});

// checkboxes.forEach(checkbox => {
//     checkbox.addEventListener('change', () => {
//         // チェックがついているものだけを数える
//         const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
//         if (countDisplay) countDisplay.textContent = checkedCount;

//         // テーブルを更新
//         tableBody.innerHTML = '';
//         const checkedItems = Array.from(checkboxes).filter(cb => cb.checked);
//         checkedItems.forEach(cb => {
//             const label = cb.closest('.option-item').querySelector('label').textContent;
//             const row = document.createElement('tr');
//             const checkboxId = cb.id;

//             row.innerHTML = `
//                 <td>${label}</td>
//                 <td>
//                     <button class="remove-selected">
//                         <svg data-target="${checkboxId}" class="icon-backspace" viewBox="0 0 48 36">
//                             <path
//                                 d="M36 12L24 24M24 12L36 24M42 2H16L2 18L16 34H42C43.0609 34 44.0783 33.5786 44.8284 32.8284C45.5786 32.0783 46 31.0609 46 30V6C46 4.93913 45.5786 3.92172 44.8284 3.17157C44.0783 2.42143 43.0609 2 42 2Z" />
//                         </svg></button>
//                 </td>
//             `;
//             tableBody.appendChild(row);
//         });


//     });
// });
// 個別のforEachはやめて、親要素に対して1回だけ設定する
const addressOptions = document.getElementById('address-options');

addressOptions.addEventListener('change', (e) => {
    // クリックされたのがチェックボックスだった場合のみ実行
    if (!e.target.classList.contains('item-checkbox')) return;

    // 最新のチェックボックス一覧をその場で取得
    const allCheckboxes = addressOptions.querySelectorAll('.item-checkbox');

    // ① チェックがついているものだけを数える
    const checkedItems = Array.from(allCheckboxes).filter(cb => cb.checked);
    if (countDisplay) countDisplay.textContent = checkedItems.length;

    // ② テーブルを更新
    tableBody.innerHTML = '';

    checkedItems.forEach(cb => {
        const labelText = cb.closest('label').querySelector('span').textContent;
        const checkboxId = cb.id;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${labelText}</td>
            <td>
                <button class="remove-selected">
                    <svg data-target="${checkboxId}" class="icon-backspace" viewBox="0 0 48 36">
                        <path d="M36 12L24 24M24 12L36 24M42 2H16L2 18L16 34H42C43.0609 34 44.0783 33.5786 44.8284 32.8284C45.5786 32.0783 46 31.0609 46 30V6C46 4.93913 45.5786 3.92172 44.8284 3.17157C44.0783 2.42143 43.0609 2 42 2Z" />
                    </svg>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
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
    };

    // 【2つ目のアドレスリスト用】
    // クリックされたのが「本体」でも「ボタン」でもない時だけ閉じる
    if (!addressList.contains(e.target) && !addAddressBtn.contains(e.target)) {
        addressList.classList.remove('open');
        tableContainer.classList.remove('is-fixed');
    };

    if (!addressSetWindow.contains(e.target) && !addressSetsBtn.contains(e.target)) {
        addressSetWindow.classList.remove('is-open');
    }
});
// ----------------------------------------------------------------

saveTemplateBtn.addEventListener('click', async () => {
    const subjectText = document.getElementById('subject-input').value;
    const bodyHTML = quill.root.innerHTML;
    const addressSetIds = Array.from(document.querySelectorAll('.item-checkbox:checked'))
        .map(cb => Number(cb.value.replace(/template/g, '')));
    const existing = await db.templates.where('subject').equals(subjectText).first();
    const now = new Date();
    const createdAtDate = existing ? existing.createdAt : now;
    const updatedAtDate = now;

    db.templates.put({
        id: existing ? existing.id : undefined,
        subject: subjectText,
        body: bodyHTML,
        addressSetId: addressSetIds,
        createdAt: createdAtDate,
        updatedAt: updatedAtDate
    }).then(id => {
        console.log('succeeded ID:', id);
        showAlert('Done', 'succeeded in saving!');
    }).catch(err => {
        showAlert('Error', err);
    });

});

// ----------------------------------------------------------------

// Quillの初期化
const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['table'],
            ['link', 'clean']
        ],
        keyboard: {
            bindings: {
                tab: {
                    key: 9, // Tabキーの番号
                    handler: function (range, context) {
                        // Tabが押されたら、4つの半角スペースを挿入
                        this.quill.insertText(range.index, '\t');
                        return false; // ブラウザ本来の「フォーカス移動」を止める
                    }
                }
            }
        }
    }
});

// ここに今後、本文監視やDB連携のJSを書いていくよ！

const db = new Dexie("MailingAppDB");

db.version(1).stores({
    templates: '++id, subject, body, addressSetId, createdAt, updatedAt',
    addressSets: '++id, setName, to, cc, bcc, addressee, co, createdAt, updatedAt',
    settings: 'id, lastUsedTemplateID, lastUsedAddressSets, updatedAt'
});

db.open().catch(err => {
    console.error("DBの接続エラー", err.stack || err);
});

// ----------------------------------------------------------------

// アラート
function showAlert(title, message) {
    document.getElementById('alertTitle').innerText = title;
    document.getElementById('alertMessage').innerText = message;
    document.getElementById('customAlert').classList.add('is-open');

    document.getElementById('alertClose').focus();
}

// 閉じるボタンのイベント
document.getElementById('alertClose').addEventListener('click', () => {
    document.getElementById('customAlert').classList.remove('is-open');
});

function showConfirm(title, message) {
    return new Promise((resolve) => {
        document.getElementById('confirmTitle').innerText = title;
        document.getElementById('confirmMessage').innerText = message;
        const modal = document.getElementById('customConfirm');
        const confirmWindow = document.getElementById('confirmWindow');

        modal.classList.add('is-open');

        modal.addEventListener('click', (e) => {
            // クリックされたのが「背景」そのものだった場合（中のウィンドウじゃなくて）
            if (e.target === modal) {
                // 揺らすクラスを追加
                confirmWindow.classList.add('shake-animation');

                // アニメーションが終わったらクラスを外す（次また振れるように）
                setTimeout(() => {
                    confirmWindow.classList.remove('shake-animation');
                }, 300);
            }
        });

        const okBtn = document.getElementById('confirmOk');
        const cancelBtn = document.getElementById('confirmCancel');

        const onOk = () => {
            cleanup();
            resolve(true);
        };

        const onCancel = () => {
            cleanup();
            resolve(false);
        };

        // 後片付け用関数（イベントを消して閉じる）
        function cleanup() {
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
            modal.classList.remove('is-open');
        }

        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);
    });
};

// テンプレート一覧の取得
(async function () {
    // 1. DBからデータを取得
    const templateSubjects = await getAlltargetCol('templates', 'subject');

    // 2. HTML文字列を作成
    const html = templateSubjects.map(item => `
        <li class="option" data-value="${item.id}">${item.subject}</li>
    `).join('');

    // 3. 親要素（ulなど）に流し込む
    const optionsContainer = document.getElementById('select-options');
    optionsContainer.innerHTML = html;

    // 4. 【重要】流し込んだ「後」で、新しくできた .option 全体にイベントを貼る
    const newOptions = optionsContainer.querySelectorAll('.option');

    newOptions.forEach(option => {
        option.addEventListener('click', async (e) => {
            e.stopPropagation();

            // data-value属性からIDを取得
            const value = option.getAttribute('data-value');
            const template = await db.templates.get(Number(value));

            if (template) {
                document.getElementById('selected-text').textContent = template.subject;
                // 選択されたテキストを反映
                document.getElementById('subject-input').value = template.subject;

                // ③ 本文をQuillにセット
                // ※ 最初に const quill = new Quill... と定義した変数を使う
                quill.clipboard.dangerouslyPasteHTML(template.body);
            };
            // 小窓を閉じる
            const selectWrapper = document.querySelector('#template-select');
            if (selectWrapper) selectWrapper.classList.remove('open');
        });
    });
}());

async function getAlltargetCol(table, col) {
    try {
        const allData = await db[table].toArray();
        const targetCol = allData.map(t => ({
            id: t.id,       // t は 1行分のデータ
            [col]: t[col]   // カラム名をキーにしたい場合は [] で囲む
        }));

        return targetCol;

    } catch (err) {
        console.error("全件取得エラー:", err);
    }
};

// アドレスリスト
addressSetsBtn.addEventListener('click', async () => {
    await loadAddressSets()
    addressSetWindow.classList.add('is-open');
});

// 現在表示しているデータのキャッシュ（保存時に使用）
let currentAddressSets = [];

// ① DBから取得して表示に反映
async function loadAddressSets() {
    try {
        currentAddressSets = await db.addressSets.toArray() || [];
        renderTable();
    } catch (err) {
        showAlert("取得失敗:", err);
    }
};

function renderTable() {
    const tbody = document.getElementById('body__address-lists');

    if (currentAddressSets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">データがありません</td></tr>';
        return;
    }

    tbody.innerHTML = currentAddressSets.map((item, index) => `
        <tr>
            <td class="setName">
                <div class="setName">
                    <input type="text" name="setName${index + 1}" id="setName${index + 1}" 
                           value="${item.setName || ''}" data-index="${index}" data-key="setName">
                </div>
            </td>
            <td class="co first-col">
                <input type="text" name="co${index + 1}" id="co${index + 1}" 
                       value="${item.co || ''}" data-index="${index}" data-key="co">
            </td>
            <td class="addressee">
                <input type="text" name="addressee${index + 1}" id="addressee${index + 1}" 
                       value="${item.addressee || ''}" data-index="${index}" data-key="addressee">
            </td>
            <td class="to">
                <input type="text" name="to${index + 1}" id="to${index + 1}" 
                       value="${item.to || ''}" data-index="${index}" data-key="to">
            </td>
            <td class="cc">
                <input type="text" name="cc${index + 1}" id="cc${index + 1}" 
                       value="${item.cc || ''}" data-index="${index}" data-key="cc">
            </td>
            <td class="bcc last-col">
                <input type="text" name="bcc${index + 1}" id="bcc${index + 1}" 
                       value="${item.bcc || ''}" data-index="${index}" data-key="bcc">
            </td>
            <td class="remove">
                <button class="remove-thisAddressSet">
                    <svg data-target="${index + 1}" class="icon-backspace" viewBox="0 0 48 36">
                        <path
                            d="M36 12L24 24M24 12L36 24M42 2H16L2 18L16 34H42C43.0609 34 44.0783 33.5786 44.8284 32.8284C45.5786 32.0783 46 31.0609 46 30V6C46 4.93913 45.5786 3.92172 44.8284 3.17157C44.0783 2.42143 43.0609 2 42 2Z" />
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');
};

// ② Addボタン：空の行を配列に追加して再描画
document.getElementById('edit-add').onclick = () => {
    currentAddressSets.push({ setName: '', addressee: '', to: '', cc: '', bcc: '' });
    renderTable();
};

// 入力内容を配列に同期（inputが変更されるたびに実行）
document.getElementById('body__address-lists').oninput = (e) => {
    const { index, key } = e.target.dataset;
    currentAddressSets[index][key] = e.target.value;
};

// tbody全体でクリックイベントを監視
document.getElementById('body__address-lists').onclick = async (e) => {
    const removeBtn = e.target.closest('.remove-thisAddressSet');

    if (removeBtn) {
        const confirmed = await showConfirm("削除の確認", "本当にこの行を削除しますか？");
        if (confirmed) {
            const svg = removeBtn.querySelector('svg');
            const index = parseInt(svg.getAttribute('data-target')) - 1;
            currentAddressSets.splice(index, 1);
            renderTable();
        };
    };
};

// ③ OKボタン：DBに反映（バルク更新）
document.getElementById('edit-ok').onclick = async () => {
    try {
        // 一旦全クリアして入れ直すか、個別にputするか
        // ここでは最も確実な「全件上書き（bulkPut）」の例
        await db.addressSets.clear();
        await db.addressSets.bulkPut(currentAddressSets);
        await renderAddressOptions();
        showAlert("Done", "保存完了！");
        addressSetWindow.classList.remove('is-open');
    } catch (err) {
        showAlert("保存失敗:", err);
    }
};

// ④ キャンセルボタン：再取得して表示を戻す
document.getElementById('edit-cancel').onclick = async () => {
    if (showConfirm("確認", "変更を破棄して戻しますか？")) {
        await loadAddressSets();
        addressSetWindow.classList.remove('is-open');
    }
};

// 初期実行
loadAddressSets();
renderAddressOptions();

async function renderAddressOptions() {
    const optionsList = document.getElementById('address-options');
    if (!optionsList) return;

    try {
        // 1. DBから最新の宛先セットを取得
        const addressSets = await db.addressSets.toArray();

        // 2. HTMLを生成（テンプレートの構造を完全維持）
        optionsList.innerHTML = addressSets.map(set => `
            <li class="option-item">
                <label>
                    <input type="checkbox" class="item-checkbox" 
                           value="${set.id}" id="item${set.id}">
                    <span>${set.setName || '無題のセット'}</span>
                </label>
            </li>
        `).join('');

    } catch (err) {
        console.error("オプションリストの更新に失敗:", err);
    }
}
// ----------------------------------------------------------------

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