import { useState, useEffect } from "react";
import { useAccount, useConnectModal } from "wagmi";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useContract, useRevealResults, useDecryptVoteCounts, useProposalCount, useProposal, useAllProposals } from "@/hooks/useContract";
import { useZamaInstance } from "@/hooks/useZamaInstance";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { decryptVoteData } from "@/lib/fhe-utils";
import { CONTRACT_ABI } from "@/lib/contract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Vote, Eye, Shield, CheckCircle, XCircle, Minus, Plus, Users } from "lucide-react";
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
    registerSelf,
    endProposal
  } = useContract();
  
  const { revealResults } = useRevealResults();
  const { decryptVoteCounts } = useDecryptVoteCounts(0);
  const { count: proposalCount } = useProposalCount();
  const { proposals, isLoading: isLoadingProposals, error: proposalsError } = useAllProposals();

  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [voteChoices, setVoteChoices] = useState<Record<string, number>>({});
  const [isVoting, setIsVoting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedResults, setDecryptedResults] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    duration: 7,
    quorumThreshold: 100,
    category: "governance",
    priority: "medium",
    tags: "",
    votingOptions: "yes_no_abstain"
  });
  const [activeTab, setActiveTab] = useState("voting");

  const handleRegister = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    setIsRegistering(true);
    try {
      console.log('🔄 Registering user as voter...');
      
      const txResult = await registerSelf();
      console.log('✅ Registration successful:', txResult);
      
      setIsRegistered(true);
      alert("Successfully registered as voter! You can now vote on proposals.");
      
    } catch (error) {
      console.error("Registration failed:", error);
      if (error.message?.includes('Already registered')) {
        setIsRegistered(true);
        alert("You are already registered as a voter.");
      } else {
        alert(`Failed to register: ${error.message || 'Please try again.'}`);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleVote = async (proposalId: number, choice: number) => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!isRegistered) {
      alert("Please register as a voter first before voting.");
      return;
    }

    if (!instance) {
      alert("FHE encryption service not ready. Please wait...");
      return;
    }

    setIsVoting(true);
    try {
      console.log('🚀 Starting vote process...', { proposalId, choice });
      
      // Cast vote and wait for transaction
      const txResult = await castVote(proposalId, choice);
      console.log('📊 Vote transaction submitted:', txResult);
      
      // Wait for transaction confirmation
      if (txResult && typeof txResult === 'object' && 'hash' in txResult) {
        console.log('⏳ Waiting for transaction confirmation...');
        // The transaction is submitted, wait for user to confirm in wallet
        alert("Please confirm the transaction in your wallet. Your vote will be encrypted and private once confirmed.");
      } else {
        // If it's a promise or different format, handle accordingly
        console.log('📊 Vote transaction result:', txResult);
        alert("Vote submitted! Please confirm in your wallet.");
      }
      
    } catch (error) {
      console.error("Voting failed:", error);
      if (error.message?.includes('Voter not verified')) {
        alert("You need to register as a voter first. Please click the 'Register as Voter' button.");
      } else {
        alert(`Failed to cast vote: ${error.message || 'Please try again.'}`);
      }
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
        newProposal.duration,
        newProposal.quorumThreshold,
        newProposal.category,
        newProposal.priority,
        newProposal.tags,
        newProposal.votingOptions
      );
      
      // Reset form with all fields
      setNewProposal({ 
        title: "", 
        description: "", 
        duration: 7, 
        quorumThreshold: 100,
        category: "governance",
        priority: "medium",
        tags: "",
        votingOptions: "yes_no_abstain"
      });
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
              <ConnectButton />
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

        {/* Tabs for Create and Vote */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="voting" className="flex items-center">
              <Vote className="h-4 w-4 mr-2" />
              Vote
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create
            </TabsTrigger>
          </TabsList>

          {/* Voting Tab */}
          <TabsContent value="voting" className="space-y-6">
            {/* Registration Status */}
            {isConnected && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">Voter Registration</h4>
                        <p className="text-sm text-muted-foreground">
                          {isRegistered ? "You are registered and can vote" : "Register to participate in voting"}
                        </p>
                      </div>
                    </div>
                    {!isRegistered ? (
                      <Button 
                        onClick={handleRegister}
                        disabled={isRegistering}
                        className="flex items-center"
                      >
                        {isRegistering ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Registering...
                          </>
                        ) : (
                          <>
                            <Users className="h-4 w-4 mr-2" />
                            Register as Voter
                          </>
                        )}
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Registered
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Active Proposals</h3>
              <Badge variant="outline" className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {proposals.length} Proposals
              </Badge>
            </div>

            {/* Proposals List */}
            {isLoadingProposals ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold mb-2">Loading Proposals...</h3>
                  <p className="text-muted-foreground">
                    Fetching proposals from the contract.
                  </p>
                </CardContent>
              </Card>
            ) : proposalsError ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                  <h3 className="text-lg font-semibold mb-2">Error Loading Proposals</h3>
                  <p className="text-muted-foreground">
                    {proposalsError.message}
                  </p>
                </CardContent>
              </Card>
            ) : proposals.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Vote className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Active Proposals</h3>
                  <p className="text-muted-foreground">
                    No proposals are currently available for voting.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
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
                          variant={voteChoices[proposal.id] === 1 ? "default" : "outline"}
                          onClick={() => setVoteChoices(prev => ({ ...prev, [proposal.id]: 1 }))}
                          disabled={isVoting}
                          className="flex items-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Yes
                        </Button>
                        <Button
                          variant={voteChoices[proposal.id] === 2 ? "default" : "outline"}
                          onClick={() => setVoteChoices(prev => ({ ...prev, [proposal.id]: 2 }))}
                          disabled={isVoting}
                          className="flex items-center"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          No
                        </Button>
                        <Button
                          variant={voteChoices[proposal.id] === 3 ? "default" : "outline"}
                          onClick={() => setVoteChoices(prev => ({ ...prev, [proposal.id]: 3 }))}
                          disabled={isVoting}
                          className="flex items-center"
                        >
                          <Minus className="h-4 w-4 mr-1" />
                          Abstain
                        </Button>
                        <Button
                          onClick={() => handleVote(parseInt(proposal.id), voteChoices[proposal.id] || 0)}
                          disabled={!voteChoices[proposal.id] || isVoting || !isRegistered}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {!isRegistered ? "Register First" : isVoting ? "Encrypting..." : "Cast Vote"}
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
            )}
          </TabsContent>

          {/* Create Proposal Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Proposal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Title *</label>
                      <input
                        type="text"
                        value={newProposal.title}
                        onChange={(e) => setNewProposal({...newProposal, title: e.target.value})}
                        className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                        placeholder="Enter proposal title"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <select
                        value={newProposal.category}
                        onChange={(e) => setNewProposal({...newProposal, category: e.target.value})}
                        className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                      >
                        <option value="governance">Governance</option>
                        <option value="treasury">Treasury</option>
                        <option value="technical">Technical</option>
                        <option value="community">Community</option>
                        <option value="partnership">Partnership</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description *</label>
                    <textarea
                      value={newProposal.description}
                      onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
                      className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-transparent h-24"
                      placeholder="Enter detailed proposal description"
                      required
                    />
                  </div>
                </div>

                {/* Voting Configuration */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Voting Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Duration (days)</label>
                      <input
                        type="number"
                        value={newProposal.duration}
                        onChange={(e) => setNewProposal({...newProposal, duration: parseInt(e.target.value)})}
                        className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                        min="1"
                        max="30"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Quorum Threshold</label>
                      <input
                        type="number"
                        value={newProposal.quorumThreshold}
                        onChange={(e) => setNewProposal({...newProposal, quorumThreshold: parseInt(e.target.value)})}
                        className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                        min="1"
                        placeholder="Minimum votes required"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <select
                        value={newProposal.priority}
                        onChange={(e) => setNewProposal({...newProposal, priority: e.target.value})}
                        className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Voting Options</label>
                    <select
                      value={newProposal.votingOptions}
                      onChange={(e) => setNewProposal({...newProposal, votingOptions: e.target.value})}
                      className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                    >
                      <option value="yes_no_abstain">Yes / No / Abstain</option>
                      <option value="yes_no">Yes / No</option>
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="ranking">Ranking</option>
                    </select>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Additional Options</h4>
                  <div>
                    <label className="text-sm font-medium">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={newProposal.tags}
                      onChange={(e) => setNewProposal({...newProposal, tags: e.target.value})}
                      className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="e.g., funding, development, community"
                    />
                  </div>
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;