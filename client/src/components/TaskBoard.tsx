import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Puzzle, Share2, UserPlus, CheckCircle } from "lucide-react";
import type { DailyTask } from "@shared/schema";

export default function TaskBoard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: tasks, isLoading } = useQuery<DailyTask[]>({
    queryKey: ['/api/tasks'],
    enabled: !!user,
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskType: string) => {
      return apiRequest('POST', `/api/tasks/${taskType}/complete`, {});
    },
    onSuccess: (_, taskType) => {
      toast({
        title: "Task Completed! 🎉",
        description: "Larry is proud of you! LLAMA coins added to your balance.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      toast({
        title: "Task Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const taskConfigs = {
    daily_spit: {
      icon: Puzzle,
      title: "Daily Spit Challenge",
      description: "Solve Larry's puzzle",
      color: "text-red-500",
      bgColor: "hover:bg-red-50",
    },
    check_in: {
      icon: Calendar,
      title: "Daily Check-In",
      description: "Claim your free LLAMA",
      color: "text-teal-500",
      bgColor: "hover:bg-teal-50",
    },
    social: {
      icon: Share2,
      title: "Social Challenge",
      description: "Share and earn",
      color: "text-purple-500",
      bgColor: "hover:bg-purple-50",
    },
    invite: {
      icon: UserPlus,
      title: "Invite a Buddy",
      description: "Bring friends to the party",
      color: "text-red-500",
      bgColor: "hover:bg-red-50",
    },
  };

  const handleCompleteTask = (taskType: string) => {
    completeTaskMutation.mutate(taskType);
  };

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-6 border-4 border-amber-900">
          <h3 className="text-3xl font-carnival text-white mb-6 text-center">Larry's Daily Tasks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="ticket-style p-4 rounded-lg animate-pulse">
                <div className="bg-gray-300 h-16 w-16 rounded-full mx-auto mb-4"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-3 rounded mb-3"></div>
                <div className="bg-gray-300 h-8 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-6 border-4 border-amber-900">
        <h3 className="text-3xl font-carnival text-white mb-6 text-center">
          🎯 Larry's Daily Tasks
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tasks?.map((task) => {
            const config = taskConfigs[task.taskType as keyof typeof taskConfigs];
            if (!config) return null;

            const Icon = config.icon;
            const isCompleted = task.completed;

            return (
              <Card 
                key={task.id}
                className={`ticket-style transform transition-all duration-300 cursor-pointer border-2 ${
                  isCompleted 
                    ? 'border-green-500 bg-green-50/90' 
                    : 'border-amber-800 hover:scale-105 ' + config.bgColor
                }`}
              >
                <CardContent className="p-4 text-center">
                  <div className="relative">
                    <Icon className={`w-12 h-12 mx-auto mb-4 ${
                      isCompleted ? 'text-green-500' : config.color
                    }`} />
                    {isCompleted && (
                      <CheckCircle className="w-6 h-6 text-green-500 absolute -top-1 -right-1" />
                    )}
                  </div>
                  
                  <h4 className="font-carnival text-amber-900 mb-2 text-lg">
                    {config.title}
                  </h4>
                  <p className="text-sm text-amber-700 mb-3 font-fredoka">
                    {config.description}
                  </p>
                  
                  {isCompleted ? (
                    <div className="bg-green-500 text-white px-3 py-2 rounded-full text-sm font-semibold font-fredoka">
                      ✅ Completed!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold font-fredoka">
                        +{task.reward} LLAMA
                      </div>
                      <Button
                        onClick={() => handleCompleteTask(task.taskType)}
                        disabled={completeTaskMutation.isPending}
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-fredoka"
                        size="sm"
                      >
                        {completeTaskMutation.isPending ? "Completing..." : "Complete Task"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Task Progress Indicator */}
        <div className="mt-6 text-center">
          <div className="bg-white/20 rounded-full p-4 inline-block">
            <p className="text-white font-carnival text-lg">
              🦙 Tasks Completed: {tasks?.filter(t => t.completed).length || 0}/{tasks?.length || 0}
            </p>
            <p className="text-yellow-100 font-fredoka text-sm">
              {tasks?.filter(t => t.completed).length === tasks?.length 
                ? "All done! Come back tomorrow for more!" 
                : "Keep going, you're doing great!"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
