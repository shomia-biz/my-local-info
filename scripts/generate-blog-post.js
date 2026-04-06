const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function run() {
  if (!GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY");
    process.exit(1);
  }

  try {
    // 1단계: 최신 데이터 확인
    const localInfoPath = path.join(process.cwd(), 'public', 'data', 'local-info.json');
    if (!fs.existsSync(localInfoPath)) {
      console.error("local-info.json을 찾을 수 없습니다.");
      process.exit(1);
    }
    const localData = JSON.parse(fs.readFileSync(localInfoPath, 'utf-8'));
    
    const allItems = [...(localData.events || []), ...(localData.benefits || [])];
    if (allItems.length === 0) {
      console.error("데이터가 없습니다.");
      process.exit(0);
    }
    
    // 가장 마지막 항목을 가져옴 (가장 나중에 추가된 항목 즉, id가 가장 높은 항목으로 가정)
    allItems.sort((a, b) => b.id - a.id);
    const latestItem = allItems[0];
    
    const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
    if (fs.existsSync(postsDir)) {
      const files = fs.readdirSync(postsDir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
          if (content.includes(latestItem.name)) {
            console.log("이미 작성된 글입니다");
            process.exit(0);
          }
        }
      }
    }

    // 2단계: Gemini AI로 블로그 글 생성
    const prompt = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(latestItem, null, 2)}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: (오늘 날짜 YYYY-MM-DD)
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: YYYY-MM-DD-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

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

    // 응답 텍스트 블록 정리
    if (textResponse.startsWith('```')) {
      const lines = textResponse.split('\n');
      if (lines[0].startsWith('```')) lines.shift();
      if (lines[lines.length - 1].startsWith('```')) lines.pop(); 
      textResponse = lines.join('\n').trim();
    }

    // FILENAME 분리
    const lines = textResponse.split('\n');
    let filenameLine = lines.find(line => line.startsWith('FILENAME:'));
    let filename = '';
    
    if (filenameLine) {
      filename = filenameLine.replace('FILENAME:', '').trim();
      textResponse = textResponse.replace(filenameLine, '').trim();
    } else {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      filename = `${yyyy}-${mm}-${dd}-auto-blog-post`;
    }
    
    if (!filename.endsWith('.md')) {
      filename += '.md';
    }

    // 3단계: 파일 저장
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }
    const filePath = path.join(postsDir, filename);
    fs.writeFileSync(filePath, textResponse, 'utf-8');
    
    console.log("블로그 글 자동 생성 및 저장 완료:", filename);

  } catch (err) {
    console.error("에러 발생:", err);
    process.exit(1);
  }
}

run();
