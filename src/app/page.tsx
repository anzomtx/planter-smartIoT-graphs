import { DataVisualizer } from '@/components/data-visualizer';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-12 lg:p-24 bg-background">
      <div className="z-10 w-full max-w-7xl items-center justify-between font-headline text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Planter-Monitor Data Visualiser
        </h1>
        <p className="mt-4 text-lg text-foreground/80">
          Real-time data from SmartIoT.space
        </p>
      </div>
      <DataVisualizer />
    </main>
  );
}
