import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  searchParams: Promise<{ title?: string; score?: string; total?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const { title = 'A Quiz', score = '0', total = '5' } = resolvedSearchParams;
  const passed = parseInt(score) >= parseInt(total) / 2;
  
  return {
    title: `I scored ${score}/${total} on the ${title} quiz | BitSave`,
    description: `I just completed the ${title} challenge on Bitsave Protocol's SaveFi platform. Can you beat my score?`,
    openGraph: {
      title: `I scored ${score}/${total} on the ${title} quiz | BitSave`,
      description: `I just completed the ${title} challenge on Bitsave Protocol's SaveFi platform. Can you beat my score?`,
      images: [
         {
           url: '/bitsavepreview.png',
           width: 1200,
           height: 630,
         }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `I scored ${score}/${total} on ${title}`,
      description: `Can you beat my score? Check out Bitsave Protocol's SaveFi platform.`
    }
  };
}

export default async function ShareScorePage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const { title = 'BitSave Quiz', score = '0', total = '5' } = resolvedSearchParams;
  const percentage = (parseInt(score) / parseInt(total)) * 100 || 0;
  
  // Decide visuals based on score
  let message = "Good effort!";
  let emoji = "👍";
  let color = "bg-yellow-500";
  let textColor = "text-yellow-400";
  
  if (percentage === 100) {
    message = "Perfect Score!";
    emoji = "🏆";
    color = "bg-[#81D7B4]";
    textColor = "text-[#81D7B4]";
  } else if (percentage >= 80) {
    message = "Excellent Knowledge!";
    emoji = "🔥";
    color = "bg-[#81D7B4]";
    textColor = "text-[#81D7B4]";
  } else if (percentage >= 50) {
    message = "Passed!";
    emoji = "✅";
    color = "bg-blue-500";
    textColor = "text-blue-400";
  }

  return (
    <div className="min-h-screen bg-[#0F1825] flex items-center justify-center p-4 selection:bg-[#81D7B4]/30">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#81D7B4]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <Image src="/bitsaveicon.jpg" alt="BitSave" width={64} height={64} className="rounded-2xl shadow-[0_0_20px_rgba(129,215,180,0.3)] mb-4" />
          <h1 className="text-3xl font-black text-white tracking-tight">Savvy Bot Challenge</h1>
        </div>

        <div className="bg-[#1A2538] border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative element */}
          <div className={`absolute top-0 left-0 w-full h-2 ${color}`} />
          
          <div className="text-center">
             <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-gray-300 text-sm font-bold mb-6">
                 {title}
             </div>
             
             <div className="text-6xl mb-4">{emoji}</div>
             
             <h2 className="text-xl text-gray-400 font-medium mb-2">{message}</h2>
             
             <div className="flex items-end justify-center gap-1 mb-8">
                <span className={`text-6xl font-black ${textColor} leading-none tracking-tighter`}>{score}</span>
                <span className="text-2xl text-gray-500 font-bold mb-1">/{total}</span>
             </div>
             
             {/* Progress Bar */}
             <div className="w-full bg-gray-800 rounded-full h-3 mb-8 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} 
                  style={{ width: `${percentage}%` }}
                />
             </div>
             
             <Link 
                href="/dashboard/savvy-bot"
                className="block w-full py-4 px-6 bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#0F1825] font-black rounded-xl transition-all shadow-[0_8px_20px_rgba(129,215,180,0.2)] hover:-translate-y-1 text-lg mb-4"
             >
                Challenge the Bot Yourself
             </Link>
             
             <Link
                href="/"
                className="block w-full py-3 px-6 bg-transparent hover:bg-gray-800 border border-gray-700 text-gray-300 font-bold rounded-xl transition-all"
             >
                Learn about BitSave
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
