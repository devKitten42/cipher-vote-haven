import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Lock, CheckCircle, Vote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, FHEEncryption } from '@/lib/contract';

interface VotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  proposalTitle: string;
}

const VotingModal = ({ isOpen, onClose, proposalId, proposalTitle }: VotingModalProps) => {
  const [selectedVote, setSelectedVote] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { isConnected } = useAccount();
  
  // Contract interaction hooks
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async () => {
    if (!selectedVote || !isConnected) return;
    
    try {
      // Convert vote choice to number (1 = Yes, 2 = No, 3 = Abstain)
      const voteChoice = selectedVote === 'yes' ? 1 : selectedVote === 'no' ? 2 : 3;
      
      // Encrypt the vote using FHE
      const { encrypted, proof } = await FHEEncryption.encryptVote(voteChoice);
      
      // Convert strings to bytes for contract call
      const encryptedBytes = new TextEncoder().encode(encrypted);
      const proofBytes = new TextEncoder().encode(proof);
      
      // Call the smart contract with encrypted vote
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'castVote',
        args: [
          BigInt(proposalId), 
          encryptedBytes, 
          proofBytes
        ],
      });
      
      setSubmitted(true);
      
      toast({
        title: "Vote Encrypted & Submitted",
        description: "Your vote has been encrypted using FHE and submitted privately to the blockchain.",
      });

      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setSelectedVote("");
      }, 2000);
    } catch (err) {
      console.error('Vote submission error:', err);
      toast({
        title: "Vote Submission Failed",
        description: "There was an error submitting your vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="p-3 rounded-full bg-governance-success/10">
              <CheckCircle className="h-8 w-8 text-governance-success" />
            </div>
            <h3 className="text-lg font-semibold">Vote Submitted Successfully</h3>
            <p className="text-sm text-muted-foreground text-center">
              Your encrypted vote has been recorded. Results will be revealed once quorum is reached.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Vote className="h-5 w-5 text-primary" />
            <span>Cast Private Vote</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h4 className="font-medium text-sm mb-2">{proposalTitle}</h4>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Your vote will be encrypted using FHE technology</span>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium">Select your vote:</Label>
            <RadioGroup value={selectedVote} onValueChange={setSelectedVote}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="text-sm">✓ Yes - Support the proposal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="text-sm">✗ No - Reject the proposal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="abstain" id="abstain" />
                <Label htmlFor="abstain" className="text-sm">~ Abstain</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedVote || isPending || isConfirming || !isConnected}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              {isPending ? "Encrypting..." : isConfirming ? "Confirming..." : "Submit Vote"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VotingModal;