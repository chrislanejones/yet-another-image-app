import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoginButtonProps {
  onClick: () => void;
}

export function LoginButton({ onClick }: LoginButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="default"
      size="sm"
      className="w-full gap-2"
    >
      <LogIn className="h-4 w-4" />
      Sign In
    </Button>
  );
}