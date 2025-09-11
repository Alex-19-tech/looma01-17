import { Button } from "@/components/ui/button";

interface StarterPromptsProps {
  onPromptSelect: (prompt: string, promptType: string) => void;
}

const starterPrompts = [
  { text: "Summarize this research paper", type: "Research" },
  { text: "Generate marketing copy", type: "Creative" },
  { text: "Debug my code", type: "Problem-Solving" },
  { text: "Design a logo brief", type: "Creative" },
  { text: "Analyze market trends", type: "Analytical" },
  { text: "Write technical documentation", type: "Instructional" }
];

export function StarterPrompts({ onPromptSelect }: StarterPromptsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 px-4">
      <div className="text-center mb-6">
        <h3 className="text-white/90 text-lg font-medium mb-2">
          Get started with these prompts
        </h3>
        <p className="text-white/60 text-sm">
          Click any prompt to get started instantly
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
        {starterPrompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => onPromptSelect(prompt.text, prompt.type)}
            className="h-auto py-3 px-4 text-left justify-start bg-white/5 backdrop-blur-sm border-white/20 text-white/90 hover:bg-white/10 hover:border-white/30 hover:text-white transition-all duration-200 rounded-xl group"
          >
            <div className="w-full">
              <div className="text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                {prompt.text}
              </div>
              <div className="text-xs text-white/50 mt-1">
                {prompt.type}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}