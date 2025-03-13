import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-6">页面不存在</p>
        <Link 
          href="/agent/login" 
          className="text-blue-600 hover:text-blue-800 underline"
        >
          返回登录页面
        </Link>
      </div>
    </div>
  );
} 