import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from "@/components/ui/button";
import { Vote, Users } from "lucide-react";
import { useAccount } from 'wagmi';

const GovernanceHeader = () => {
  const { isConnected, address } = useAccount();

  return (
    <header className="border-b border-border bg-gradient-subtle">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Vote className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Cipher Vote Haven</h1>
              <p className="text-sm text-muted-foreground">FHE-Encrypted Governance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>1,247 Members</span>
            </div>
            
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default GovernanceHeader;