interface SuggestedPromptsProps {
  onSelect: (message: string) => void;
}

const prompts = [
  "Where is my order?",
  "What is the cancellation policy?",
  "I need help with my delivery",
  "I want to talk to a human",
];

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-orange-300 hover:bg-orange-50"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
