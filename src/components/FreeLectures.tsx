import FreeLectures from '@/components/FreeLectures';

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50 pt-10">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900">Free Course Lectures</h1>
        <p className="mt-4 text-gray-600">High-quality video lessons for your preparation.</p>
      </div>
      
      <FreeLectures />
    </main>
  );
}
