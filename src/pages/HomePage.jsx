export default function HomePage() {
  return (
    <main className="fixed inset-0 w-screen h-screen overflow-hidden">
      <video
        poster="public/video-hero-section.png"
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 min-w-full min-h-full w-full h-full object-cover -z-10"
      >
        <source src="/video-hero-section.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Optional overlay - adjust opacity or color */}
      <div className="absolute inset-0 bg-blue-500/20 -z-10"></div>
      {/* Options:
        - Lighter overlay: "bg-black/10"
        - Colored overlay: "bg-blue-500/20"
        - Gradient overlay: "bg-gradient-to-b from-black/20 to-transparent"
        - Warm overlay: "bg-orange-900/10"
        - Cool overlay: "bg-blue-900/10"
      */}
    </main>
  );
}
