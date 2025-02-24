import { useEffect, useState } from "react";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";

export const useGetLiveCalls = (teamId: string) => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const client = useStreamVideoClient();

  useEffect(() => {
    if (!client || !teamId) return;

    const loadCalls = async () => {
      try {
        const { calls } = await client.queryCalls({
            filter_conditions: { teamId }
        });

        // Filter calls to include only those with participants
        const liveCalls = calls.filter((call) => call.state.participantCount > 0);

        setCalls(liveCalls);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCalls();
  }, [client, teamId]);

  return { calls, isLoading };
};
