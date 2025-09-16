import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Eye, EyeOff } from "lucide-react";
import VotingModal from "./VotingModal";

interface ProposalCardProps {
  id: string;
  title: string;
  description: string;
  status: "active" | "ended" | "pending";
  endTime: string;
  totalVotes: number;
  quorumReached: boolean;
  results?: {
    yes: number;
    no: number;
    abstain: number;
  };
}

const ProposalCard = ({ 
  id, 
  title, 
  description, 
  status, 
  endTime, 
  totalVotes, 
  quorumReached,
  results 
}: ProposalCardProps) => {
  const [showVoting, setShowVoting] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-governance-success";
      case "ended": return "bg-muted";
      case "pending": return "bg-governance-warning";
      default: return "bg-muted";
    }
  };

  return (
    <>
      <Card className="hover:shadow-glow transition-all duration-300 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold mb-2">{title}</CardTitle>
              <div className="flex items-center space-x-3">
                <Badge className={`${getStatusColor(status)} text-white`}>
                  {status.toUpperCase()}
                </Badge>
                {!quorumReached && status === "active" && (
                  <div className="flex items-center text-muted-foreground">
                    <EyeOff className="h-4 w-4 mr-1" />
                    <span className="text-xs">Encrypted</span>
                  </div>
                )}
                {quorumReached && (
                  <div className="flex items-center text-governance-success">
                    <Eye className="h-4 w-4 mr-1" />
                    <span className="text-xs">Results Revealed</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{endTime}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{totalVotes} votes</span>
              </div>
            </div>

            {status === "active" && (
              <Button 
                onClick={() => setShowVoting(true)}
                size="sm"
                className="bg-gradient-primary hover:opacity-90"
              >
                Vote Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <VotingModal
        isOpen={showVoting}
        onClose={() => setShowVoting(false)}
        proposalId={id}
        proposalTitle={title}
      />
    </>
  );
};

export default ProposalCard;