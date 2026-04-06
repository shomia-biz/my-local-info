import { getPostData, getSortedPostsData } from '@/lib/posts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Post({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const postData = getPostData(resolvedParams.slug);

  if (!postData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">글을 찾을 수 없습니다.</h1>
        <Link href="/blog" className="text-blue-600 hover:underline font-medium px-4 py-2 bg-blue-50 rounded-lg">
          ← 블로그 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      <header className="bg-blue-600 text-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.3)] sticky top-0 z-10 transition-all">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/blog" className="text-lg font-bold flex items-center hover:text-blue-200 transition-colors">
            <span className="mr-2 text-xl">←</span> 블로그
          </Link>
          <Link href="/" className="text-sm font-medium hover:text-blue-200 transition-colors">
            홈으로
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <article className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-12 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
          
          <header className="mb-10 text-center border-b border-slate-100 pb-10">
            {postData.category && (
              <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wide">
                {postData.category}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-slate-900 leading-tight">
              {postData.title}
            </h1>
            <div className="text-slate-500 text-sm font-medium flex items-center justify-center space-x-2">
              <span className="text-lg">📅</span>
              <time>{postData.date}</time>
            </div>
          </header>
          
          <div className="prose prose-blue prose-lg sm:prose-xl max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl prose-img:shadow-md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {postData.content}
            </ReactMarkdown>
          </div>
        </article>
      </main>
    </div>
  );
}
