import { useState } from "react";
import GovernanceHeader from "@/components/GovernanceHeader";
import ProposalCard from "@/components/ProposalCard";
import ResultsChart from "@/components/ResultsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Shield, Users, Vote } from "lucide-react";
import heroImage from "@/assets/governance-hero.jpg";

const Index = () => {
  const [activeTab, setActiveTab] = useState("proposals");

  // Mock data
  const proposals = [
    {
      id: "1",
      title: "Increase Development Fund Allocation",
      description: "Proposal to allocate an additional 500,000 tokens to the development fund for Q2 2024 roadmap execution and ecosystem growth initiatives.",
      status: "active" as const,
      endTime: "2 days left",
      totalVotes: 1247,
      quorumReached: false,
    },
    {
      id: "2", 
      title: "Implement Quarterly Governance Reviews",
      description: "Establish regular governance review sessions to assess DAO performance, member engagement, and process improvements.",
      status: "active" as const,
      endTime: "5 days left",
      totalVotes: 892,
      quorumReached: false,
    },
    {
      id: "3",
      title: "Update Treasury Management Strategy",
      description: "Modernize treasury allocation strategy to include DeFi yield farming and risk diversification across multiple protocols.",
      status: "ended" as const,
      endTime: "Ended 3 days ago",
      totalVotes: 2156,
      quorumReached: true,
      results: { yes: 1634, no: 412, abstain: 110 }
    }
  ];

  const chartData = [
    { name: "Yes", value: 1634, color: "hsl(var(--governance-success))" },
    { name: "No", value: 412, color: "hsl(var(--governance-danger))" },
    { name: "Abstain", value: 110, color: "hsl(var(--muted))" },
  ];

  const stats = [
    { label: "Total Proposals", value: "47", icon: Vote, color: "text-primary" },
    { label: "Active Members", value: "1,247", icon: Users, color: "text-governance-success" },
    { label: "Encrypted Votes", value: "15,392", icon: Shield, color: "text-governance-secondary" },
    { label: "Participation Rate", value: "73.5%", icon: TrendingUp, color: "text-governance-warning" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <GovernanceHeader />
      
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-primary opacity-90" />
        
        <div className="relative container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Vote Privately. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-glow">
              Govern Transparently.
            </span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Secure democratic governance powered by Fully Homomorphic Encryption. 
            Cast votes privately while ensuring transparent results once quorum is reached.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 border-b border-border">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="p-6">
                  <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="proposals">Active Proposals</TabsTrigger>
              <TabsTrigger value="results">Past Results</TabsTrigger>
            </TabsList>

            <TabsContent value="proposals" className="space-y-6">
              <div className="grid gap-6">
                {proposals
                  .filter(p => p.status === "active")
                  .map((proposal) => (
                    <ProposalCard key={proposal.id} {...proposal} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="results">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  {proposals
                    .filter(p => p.status === "ended" && p.quorumReached)
                    .map((proposal) => (
                      <ProposalCard key={proposal.id} {...proposal} />
                    ))}
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Latest Results: Treasury Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResultsChart 
                      data={chartData} 
                      title="Vote Distribution"
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Index;