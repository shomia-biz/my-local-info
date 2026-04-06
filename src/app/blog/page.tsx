import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

export default function Blog() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
              블로그 <span className="ml-2 text-3xl">📝</span>
            </h1>
            <p className="mt-2 text-blue-100 opacity-90">최신 소식과 유용한 팁을 확인하세요!</p>
          </div>
          <nav className="mt-4 sm:mt-0">
            <Link href="/" className="font-bold text-blue-100 hover:text-white transition-colors bg-blue-700/50 px-4 py-2 rounded-lg">
              홈으로 🏠
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8 relative">
        <h2 className="text-xl md:text-2xl font-bold text-blue-800 mb-6 flex items-center">
          <span className="text-2xl mr-2">📚</span> 
          최신 글 목록
        </h2>
        
        {allPostsData.length === 0 ? (
          <p className="text-gray-500 bg-white p-8 rounded-2xl text-center border border-dashed border-gray-300">아직 작성된 글이 없습니다.</p>
        ) : (
          <div className="grid gap-6">
            {allPostsData.map(({ slug, title, date, summary, category }) => (
              <article key={slug} className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {category || '일반'}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">{date}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 mt-2">
                  <Link href={`/blog/${slug}`} className="hover:text-blue-600 transition-colors">
                    {title}
                  </Link>
                </h3>
                <p className="text-gray-600 line-clamp-2">{summary}</p>
                <div className="mt-4 text-right">
                  <Link href={`/blog/${slug}`} className="text-sm text-blue-600 font-semibold hover:underline">
                    계속 읽기 &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
