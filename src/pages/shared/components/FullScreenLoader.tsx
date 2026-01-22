import Loader from "./Loader";

export default function FullScreenLoader({ label }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[999] bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-background-card rounded-xl px-6 py-5 shadow-xl">
        <Loader size="lg" label={label ?? "Loading..."} />
      </div>
    </div>
  );
}
