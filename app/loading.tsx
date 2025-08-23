export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-foreground">Loading InfyRescue...</h2>
        <p className="text-muted-foreground">Preparing disaster response coordination platform</p>
      </div>
    </div>
  );
}
