import fs from 'fs';
import path from 'path';
import Link from 'next/link';

// 데이터 읽기 함수
async function getLocalInfo() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'local-info.json');
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(jsonData);
}

// 정적 사이트 생성을 위한 모든 가능한 ID를 미리 알려주는 함수
export async function generateStaticParams() {
  const data = await getLocalInfo();
  const allItems = [...data.events, ...data.benefits];
  
  return allItems.map((item: any) => ({
    id: item.id.toString(),
  }));
}

// 상세 페이지 화면
export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  // 경로 파라미터 언래핑
  const resolvedParams = await params;
  
  const data = await getLocalInfo();
  const allItems = [...data.events, ...data.benefits];
  const item = allItems.find((i: any) => i.id.toString() === resolvedParams.id);

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">앗! 정보를 찾을 수 없습니다.</h1>
        <Link href="/" className="text-blue-600 underline text-lg">홈으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* 상단 타이틀 영역 */}
        <div className="bg-blue-600 text-white p-6 md:p-10">
          <span className="inline-block bg-white/20 text-white text-sm font-bold px-4 py-1.5 rounded-full mb-5">
            {item.category}
          </span>
          <h1 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">{item.name}</h1>
          <p className="text-blue-100 text-lg opacity-90 leading-relaxed">{item.summary}</p>
        </div>

        {/* 상세 정보 영역 */}
        <div className="p-6 md:p-10 space-y-8">
          
          {/* 핵심 요약 박스 */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center">
              <span className="text-2xl mr-2">📌</span> 핵심 정보
            </h2>
            <ul className="space-y-4 text-slate-700 text-lg">
              <li className="flex flex-col sm:flex-row sm:items-start">
                <span className="font-semibold text-blue-800 min-w-28 mb-1 sm:mb-0">기간:</span>
                <span>{item.startDate === item.endDate ? item.startDate : `${item.startDate} ~ ${item.endDate}`}</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-start">
                <span className="font-semibold text-blue-800 min-w-28 mb-1 sm:mb-0">장소/방법:</span>
                <span>{item.location}</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-start">
                <span className="font-semibold text-blue-800 min-w-28 mb-1 sm:mb-0">참여 대상:</span>
                <span>{item.target}</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">💡</span> 상세 내용
            </h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
              이곳에 더 길고 자세한 내용이 들어갈 수 있습니다.<br/><br/>
              현재는 임시로 만들어진 샘플 데이터이므로 상세 내용이 짧습니다.
              나중에 진짜 외부 데이터를 연결하면 여기에 더 풍성한 설명글, 포스터 이미지, 신청 링크 등이 들어올 수 있습니다! 환상적일 거예요! 😎
            </p>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-center">
            <Link 
              href="/" 
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-10 rounded-xl transition-colors text-lg"
            >
              목록으로 돌아가기
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
