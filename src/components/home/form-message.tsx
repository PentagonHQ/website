export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex flex-col gap-2 w-full text-sm text-center">
      {"success" in message && (
        <div className="text-emerald-400 px-4">
          {message.success}
        </div>
      )}
      {"error" in message && (
        <div className="text-red-400 px-4">
          {message.error}
        </div>
      )}
      {"message" in message && (
        <div className="text-yellow-400 px-4">{message.message}</div>
      )}
    </div>
  );
}
