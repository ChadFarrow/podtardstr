import { ExternalLink, Heart } from 'lucide-react';

interface FundingInfo {
  url: string;
  message: string;
}

interface FundingButtonProps {
  funding: FundingInfo;
}

export function FundingButton({ funding }: FundingButtonProps) {
  const handleFundingClick = () => {
    window.open(funding.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleFundingClick}
      className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
    >
      <Heart size={20} className="text-red-200" />
      <span>{funding.message}</span>
      <ExternalLink size={16} className="text-red-200" />
    </button>
  );
}