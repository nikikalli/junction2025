import { Button } from "@/components/ui/button";

interface HeaderWithBackButtonProps {
  onBack: () => void;
  title: string;
  subtitle?: string;
}

export const HeaderWithBackButton = ({
  onBack,
  title,
  subtitle,
}: HeaderWithBackButtonProps) => {
  return (
    <div className="flex flex-row gap-3 relative">
      <div className="flex flex-row gap-3 items-center">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-neutral-400 hover:text-gray-600 p-0 h-auto font-medium text-sm absolute -top-12"
        >
          ← Back
        </Button>
        <h3 className="text-lg text-neutral-100">{title}</h3>
      </div>
      {subtitle && <p className="text-lg text-gray-400">{subtitle}</p>}
    </div>
  );
};
