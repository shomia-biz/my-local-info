import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

export interface PostData {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  content: string;
}

export function getSortedPostsData(): PostData[] {
  if (!fs.existsSync(postsDirectory)) return [];
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.filter(fileName => fileName.endsWith('.md')).map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const matterResult = matter(fileContents);
    let dateStr = matterResult.data.date;
    
    // date 필드가 Date 객체인 경우 YYYY-MM-DD 문자열로 변환 처리
    if (dateStr instanceof Date) {
      const year = dateStr.getFullYear();
      const month = String(dateStr.getMonth() + 1).padStart(2, '0');
      const day = String(dateStr.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    }

    return {
      slug,
      content: matterResult.content,
      title: matterResult.data.title || '',
      date: dateStr || '',
      summary: matterResult.data.summary || '',
      category: matterResult.data.category || '',
      tags: matterResult.data.tags || [],
    };
  });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getPostData(slug: string): PostData | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const matterResult = matter(fileContents);
  
  let dateStr = matterResult.data.date;
  if (dateStr instanceof Date) {
    const year = dateStr.getFullYear();
    const month = String(dateStr.getMonth() + 1).padStart(2, '0');
    const day = String(dateStr.getDate()).padStart(2, '0');
    dateStr = `${year}-${month}-${day}`;
  }

  return {
    slug,
    content: matterResult.content,
    title: matterResult.data.title || '',
    date: dateStr || '',
    summary: matterResult.data.summary || '',
    category: matterResult.data.category || '',
    tags: matterResult.data.tags || [],
  };
}
