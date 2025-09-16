import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContract } from '@/hooks/useContract';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateProposalModal = ({ isOpen, onClose }: CreateProposalModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(7); // days
  const [quorumThreshold, setQuorumThreshold] = useState(100);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  
  // Contract interaction hooks
  const { createProposal, isPending, isConfirming, isConfirmed, error, isConnected } = useContract();

  const handleSubmit = async () => {
    if (!title || !description || !isConnected) return;
    
    try {
      // Create proposal using contract hook
      await createProposal(title, description, duration, quorumThreshold);
      
      setSubmitted(true);
      
      toast({
        title: "Proposal Created Successfully",
        description: "Your proposal has been submitted to the blockchain and is now active for voting.",
      });

      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setTitle("");
        setDescription("");
        setDuration(7);
        setQuorumThreshold(100);
      }, 2000);
    } catch (err) {
      console.error('Proposal creation error:', err);
      toast({
        title: "Proposal Creation Failed",
        description: "There was an error creating your proposal. Please try again.",
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
            <h3 className="text-lg font-semibold">Proposal Created Successfully</h3>
            <p className="text-sm text-muted-foreground text-center">
              Your proposal has been submitted to the blockchain and is now active for voting.
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
            <Plus className="h-5 w-5 text-primary" />
            <span>Create New Proposal</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Proposal Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter proposal title..."
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your proposal in detail..."
              rows={4}
              maxLength={1000}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={1}
                max={30}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quorum">Quorum Threshold</Label>
              <Input
                id="quorum"
                type="number"
                value={quorumThreshold}
                onChange={(e) => setQuorumThreshold(Number(e.target.value))}
                min={1}
                max={10000}
              />
            </div>
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
              disabled={!title || !description || isPending || isConfirming || !isConnected}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              {isPending ? "Creating..." : isConfirming ? "Confirming..." : "Create Proposal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProposalModal;
