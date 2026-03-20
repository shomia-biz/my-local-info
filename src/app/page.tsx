import fs from 'fs';
import path from 'path';

// 나중에 진짜 외부(API)에서 가져올 때를 위해 흉내낸 함수입니다.
// 지금은 컴퓨터 안에 있는 가짜 데이터 파일(.json)을 읽어옵니다.
async function getLocalInfo() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'local-info.json');
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(jsonData);
}

export default async function Home() {
  // 정보 불러오기
  const data = await getLocalInfo();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      
      {/* 1. 상단 헤더 */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            성남시 생활 정보 <span className="ml-2 text-3xl">🌊</span>
          </h1>
          <p className="mt-2 text-blue-100 opacity-90">우리 동네의 유용한 행사와 알짜배기 혜택을 모아보세요!</p>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* 2. 이번 달 행사/축제 영역 */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-blue-800 mb-6 flex items-center">
            <span className="text-2xl mr-2">📅</span> 
            이번 달 행사 / 축제
          </h2>
          {/* 모바일에서는 1줄(세로), 컴퓨터에서는 2줄(가로)로 예쁘게 정렬 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {data.events.map((item: any) => (
              <article key={item.id} className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                  {item.category}
                </span>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-4 min-h-[40px] leading-relaxed">{item.summary}</p>
                
                <div className="bg-blue-50/50 rounded-lg p-3 text-sm text-gray-600 space-y-1.5">
                  <p><strong className="text-blue-900 font-semibold mr-1">📅 기간:</strong> {item.startDate === item.endDate ? item.startDate : `${item.startDate} ~ ${item.endDate}`}</p>
                  <p><strong className="text-blue-900 font-semibold mr-1">📍 장소:</strong> {item.location}</p>
                  <p><strong className="text-blue-900 font-semibold mr-1">🧑‍🤝‍🧑 대상:</strong> {item.target}</p>
                </div>
                
                <a href={item.url} className="mt-4 block text-center bg-white border border-blue-200 text-blue-600 font-semibold py-2.5 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  자세히 보기
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* 3. 지원금/혜택 정보 영역 */}
        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-blue-800 mb-6 flex items-center">
            <span className="text-2xl mr-2">💎</span> 
            주요 지원금 및 혜택
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {data.benefits.map((item: any) => (
              <article key={item.id} className="bg-white rounded-2xl shadow-sm border border-cyan-100 p-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <span className="inline-block bg-cyan-100 text-cyan-800 text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                  {item.category}
                </span>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-4 min-h-[40px] leading-relaxed">{item.summary}</p>
                
                <div className="bg-cyan-50/50 rounded-lg p-3 text-sm text-gray-600 space-y-1.5">
                  <p><strong className="text-cyan-900 font-semibold mr-1">🧑‍🤝‍🧑 대상:</strong> {item.target}</p>
                  <p><strong className="text-cyan-900 font-semibold mr-1">📍 신청방법:</strong> {item.location}</p>
                </div>
                
                <a href={item.url} className="mt-4 block text-center bg-white border border-cyan-200 text-cyan-700 font-semibold py-2.5 rounded-xl hover:bg-cyan-50 hover:border-cyan-300 transition-colors">
                  신청하기 알아보기
                </a>
              </article>
            ))}
          </div>
        </section>

      </main>

      {/* 4. 하단 푸터 (꼬리말) */}
      <footer className="bg-slate-100 text-slate-500 py-8 border-t border-slate-200 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center text-sm">
          <p>📊 데이터 출처: 공공데이터포털 (data.go.kr)</p>
          <p className="mt-2 sm:mt-0 font-medium text-slate-400">마지막 업데이트: {data.lastUpdated}</p>
        </div>
      </footer>
      
    </div>
  );
}
