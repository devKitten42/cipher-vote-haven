import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useContract, useRevealResults, useDecryptVoteCounts } from "@/hooks/useContract";
import { useZamaInstance } from "@/hooks/useZamaInstance";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { decryptVoteData } from "@/lib/fhe-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Vote, Eye, Shield, CheckCircle, XCircle, Minus } from "lucide-react";
import { CONTRACT_ADDRESS } from "@/config/contracts";

interface Proposal {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  isEnded: boolean;
  proposer: string;
  startTime: number;
  endTime: number;
  quorumThreshold: number;
  resultsRevealed: boolean;
}

const Index = () => {
  const { address, isConnected } = useAccount();
  const { instance } = useZamaInstance();
  const signerPromise = useEthersSigner();
  const { 
    createProposal, 
    castVote, 
    registerVoter, 
    endProposal
  } = useContract();
  
  const { revealResults } = useRevealResults();
  const { decryptVoteCounts } = useDecryptVoteCounts(0);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [voteChoice, setVoteChoice] = useState<number>(0);
  const [isVoting, setIsVoting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedResults, setDecryptedResults] = useState<any>(null);
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    duration: 7,
    quorumThreshold: 100
  });

  // Load proposals from contract
  useEffect(() => {
    const loadProposals = async () => {
      try {
        // This would be replaced with actual contract calls
        // For now, using mock data
        const mockProposals: Proposal[] = [
          {
            id: "1",
            title: "Increase Development Fund Allocation",
            description: "Proposal to allocate an additional 500,000 tokens to the development fund for Q2 2024 roadmap execution.",
            isActive: true,
            isEnded: false,
            proposer: "0x1234...5678",
            startTime: Date.now() - 86400000, // 1 day ago
            endTime: Date.now() + 172800000, // 2 days from now
            quorumThreshold: 100,
            resultsRevealed: false
          },
          {
            id: "2",
            title: "Implement Quarterly Governance Reviews",
            description: "Establish regular governance review sessions to assess DAO performance and member engagement.",
            isActive: true,
            isEnded: false,
            proposer: "0x2345...6789",
            startTime: Date.now() - 259200000, // 3 days ago
            endTime: Date.now() + 432000000, // 5 days from now
            quorumThreshold: 150,
            resultsRevealed: false
          }
        ];
        setProposals(mockProposals);
      } catch (error) {
        console.error("Failed to load proposals:", error);
      }
    };

    loadProposals();
  }, []);

  const handleVote = async (proposalId: number, choice: number) => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!instance) {
      alert("FHE encryption service not ready. Please wait...");
      return;
    }

    setIsVoting(true);
    try {
      await castVote(proposalId, choice);
      alert("Vote cast successfully! Your vote is encrypted and private.");
    } catch (error) {
      console.error("Voting failed:", error);
      alert("Failed to cast vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  const handleDecryptResults = async (proposalId: number) => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!instance || !signerPromise) {
      alert("FHE decryption service not ready. Please wait...");
      return;
    }

    setIsDecrypting(true);
    try {
      // First reveal results on contract
      await revealResults(proposalId);
      
      // Then decrypt the results
      const signer = await signerPromise;
      const decryptedData = await decryptVoteCounts(instance, signer);
      
      setDecryptedResults(decryptedData);
      alert("Results decrypted successfully!");
    } catch (error) {
      console.error("Decryption failed:", error);
      alert("Failed to decrypt results. Please try again.");
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCreateProposal = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      await createProposal(
        newProposal.title,
        newProposal.description,
        newProposal.duration * 24 * 60 * 60, // Convert days to seconds
        newProposal.quorumThreshold
      );
      
      setNewProposal({ title: "", description: "", duration: 7, quorumThreshold: 100 });
      alert("Proposal created successfully!");
    } catch (error) {
      console.error("Failed to create proposal:", error);
      alert("Failed to create proposal. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Cipher Vote Haven</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <Badge variant="outline" className="text-green-600">
                  <Lock className="h-4 w-4 mr-1" />
                  FHE Ready
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600">
                  Wallet Not Connected
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Private Voting with FHE Encryption
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cast encrypted votes that remain private until results are revealed. 
            Your vote choice is protected by Fully Homomorphic Encryption.
          </p>
        </div>

        {/* Create Proposal Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Vote className="h-5 w-5 mr-2" />
              Create New Proposal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal({...newProposal, title: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter proposal title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Duration (days)</label>
                <input
                  type="number"
                  value={newProposal.duration}
                  onChange={(e) => setNewProposal({...newProposal, duration: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded-md"
                  min="1"
                  max="30"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={newProposal.description}
                onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
                className="w-full p-2 border rounded-md h-24"
                placeholder="Enter proposal description"
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleCreateProposal}
                disabled={!newProposal.title || !newProposal.description}
                className="bg-primary hover:bg-primary/90"
              >
                Create Proposal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Proposals List */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Active Proposals</h3>
          {proposals.map((proposal) => (
            <Card key={proposal.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{proposal.title}</CardTitle>
                  <Badge variant={proposal.isActive ? "default" : "secondary"}>
                    {proposal.isActive ? "Active" : "Ended"}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{proposal.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Voting Section */}
                  {proposal.isActive && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Cast Your Vote (Encrypted)</h4>
                      <div className="flex space-x-2">
                        <Button
                          variant={voteChoice === 1 ? "default" : "outline"}
                          onClick={() => setVoteChoice(1)}
                          disabled={isVoting}
                          className="flex items-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Yes
                        </Button>
                        <Button
                          variant={voteChoice === 2 ? "default" : "outline"}
                          onClick={() => setVoteChoice(2)}
                          disabled={isVoting}
                          className="flex items-center"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          No
                        </Button>
                        <Button
                          variant={voteChoice === 3 ? "default" : "outline"}
                          onClick={() => setVoteChoice(3)}
                          disabled={isVoting}
                          className="flex items-center"
                        >
                          <Minus className="h-4 w-4 mr-1" />
                          Abstain
                        </Button>
                        <Button
                          onClick={() => handleVote(parseInt(proposal.id), voteChoice)}
                          disabled={voteChoice === 0 || isVoting}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {isVoting ? "Encrypting..." : "Cast Vote"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Results Section */}
                  {!proposal.isActive && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Vote Results</h4>
                        <Button
                          onClick={() => handleDecryptResults(parseInt(proposal.id))}
                          disabled={isDecrypting}
                          variant="outline"
                          className="flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {isDecrypting ? "Decrypting..." : "Decrypt Results"}
                        </Button>
                      </div>
                      
                      {decryptedResults && (
                        <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {decryptedResults.yesVotes || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Yes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {decryptedResults.noVotes || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">No</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">
                              {decryptedResults.abstainVotes || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Abstain</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Proposal Info */}
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Proposer: {proposal.proposer}</div>
                    <div>Quorum Threshold: {proposal.quorumThreshold} votes</div>
                    <div>
                      {proposal.isActive 
                        ? `Ends in ${Math.ceil((proposal.endTime - Date.now()) / (1000 * 60 * 60 * 24))} days`
                        : "Voting ended"
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;