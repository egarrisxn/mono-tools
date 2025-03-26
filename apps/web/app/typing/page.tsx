import { quotes } from "@/utils/quotes";
import TypingTest from "@/components/typing/typing-test";

export default function TypingPage() {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-24 md:px-8 lg:px-24">
      <div className="mx-auto flex w-full max-w-6xl">
        <TypingTest quotes={quotes} />
      </div>
    </div>
  );
}
