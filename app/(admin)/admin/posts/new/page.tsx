import React from 'react';
import AdminTopBar from '@/components/admin/AdminTopBar';
import PostEditor from '@/components/admin/PostEditor';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewPostPage() {
  return (
    <>
      <AdminTopBar />
      
      <main className="p-8">
        <div className="mb-8">
          <Link 
            href="/admin/posts" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#CC0000] transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            Back to Posts
          </Link>
          <h1 className="text-4xl font-black text-[#1a1a1a]">Create New Post</h1>
        </div>

        <PostEditor mode="create" />
      </main>
    </>
  );
}
