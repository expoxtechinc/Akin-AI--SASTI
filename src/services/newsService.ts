/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  source: string;
  link: string;
  image?: string;
}

const API_KEY = process.env.VITE_NEWSDATA_API_KEY || 'pub_1cde5f81113e44efafd866a26437daea';
const BASE_URL = 'https://newsdata.io/api/1/news';

export async function fetchLatestNews(queryStr: string = 'tech,scholarship,liberia'): Promise<NewsItem[]> {
  try {
    const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&q=${encodeURIComponent(queryStr)}&language=en`);
    const data = await response.json();

    if (data.status === 'success' && data.results) {
      return data.results.map((item: any, index: number) => ({
        id: item.article_id || `news-${index}`,
        title: item.title || 'No Title',
        excerpt: item.description || item.content || 'No description available.',
        category: (item.category && item.category[0]) || 'general',
        date: new Date(item.pub_date || item.pubDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        source: item.source_id || 'News Source',
        link: item.link || '#',
        image: item.image_url
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function syncNewsToFeed(newsItems: NewsItem[]) {
  try {
    for (const item of newsItems.slice(0, 3)) { // Only sync top 3 to avoid spam
      // Check if already exists by title (simple check)
      const q = query(collection(db, 'posts'), where('title', '==', item.title), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        await addDoc(collection(db, 'posts'), {
          title: item.title,
          content: item.excerpt,
          type: 'news',
          mediaUrl: item.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800',
          source: item.source,
          link: item.link,
          tags: [item.category, 'auto-synced', 'live'],
          createdAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Error syncing news to feed:', error);
  }
}
