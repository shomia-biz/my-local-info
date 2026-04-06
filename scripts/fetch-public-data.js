const fs = require('fs');
const path = require('path');

const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function run() {
  if (!PUBLIC_DATA_API_KEY || !GEMINI_API_KEY) {
    console.error("Missing API Keys");
    process.exit(1);
  }

  try {
    const url = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=20&returnType=JSON&serviceKey=${encodeURIComponent(PUBLIC_DATA_API_KEY)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Public API Error: ${res.status}`);
    const apiData = await res.json();
    const items = apiData.data || [];

    let filtered = items.filter(item => {
      const texts = [item.SVC_NM, item.SVC_PVSN_ENNC, item.TRGTER_INDVDL_ARRAY, item.JURMN_NM].join(' ');
      return texts.includes('성남');
    });

    if (filtered.length === 0) {
      filtered = items.filter(item => {
        const texts = [item.SVC_NM, item.SVC_PVSN_ENNC, item.TRGTER_INDVDL_ARRAY, item.JURMN_NM].join(' ');
        return texts.includes('경기');
      });
    }

    if (filtered.length === 0) {
      filtered = items;
    }

    const localInfoPath = path.join(process.cwd(), 'public', 'data', 'local-info.json');
    let localData = { events: [], benefits: [], lastUpdated: "" };
    if (fs.existsSync(localInfoPath)) {
      localData = JSON.parse(fs.readFileSync(localInfoPath, 'utf-8'));
    }

    const existingNames = new Set([
      ...localData.events.map(e => e.name),
      ...localData.benefits.map(b => b.name)
    ]);

    const newItems = filtered.filter(item => !existingNames.has(item.SVC_NM));
    if (newItems.length === 0) {
      console.log("새로운 데이터가 없습니다");
      process.exit(0);
    }

    const itemToProcess = newItems[0];

    const prompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해.
startDate가 없으면 오늘 날짜, endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

데이터:
${JSON.stringify(itemToProcess, null, 2)}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      })
    });

    if (!geminiRes.ok) throw new Error(`Gemini API Error: ${geminiRes.status}`);
    const geminiData = await geminiRes.json();
    let textResponse = geminiData.candidates[0].content.parts[0].text.trim();

    if (textResponse.startsWith('```')) {
      const lines = textResponse.split('\n');
      if (lines[0].startsWith('```')) lines.shift();
      if (lines[lines.length - 1].startsWith('```')) lines.pop();
      textResponse = lines.join('\n').trim();
    }

    const parsedNewItem = JSON.parse(textResponse);

    const allIds = [
      ...localData.events.map(e => e.id),
      ...localData.benefits.map(b => b.id)
    ];
    const maxId = allIds.length > 0 ? Math.max(...allIds) : 0;
    parsedNewItem.id = maxId + 1;
    
    if (parsedNewItem.url && !parsedNewItem.link) {
      parsedNewItem.link = parsedNewItem.url;
    } else if (parsedNewItem.link && !parsedNewItem.url) {
      parsedNewItem.url = parsedNewItem.link;
    }

    if (parsedNewItem.category === '행사' || parsedNewItem.category === '행사/축제') {
      localData.events.push(parsedNewItem);
    } else {
      localData.benefits.push(parsedNewItem);
    }

    const today = new Date();
    localData.lastUpdated = `${today.getFullYear()}. ${String(today.getMonth() + 1).padStart(2, '0')}. ${String(today.getDate()).padStart(2, '0')}`;

    fs.writeFileSync(localInfoPath, JSON.stringify(localData, null, 2));
    console.log("새 항목이 추가되었습니다:", parsedNewItem.name);

  } catch (err) {
    console.error("에러 발생:", err);
    process.exit(1);
  }
}

run();
