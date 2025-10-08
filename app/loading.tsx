export default function RootLoading() {
  return (
    <div className="fixed inset-0 bg-neutral-950 text-white z-[9999]">
      <div
        className="absolute font-bold tracking-tight"
        style={{
          right: "clamp(1rem, 2vw, 3rem)",
          bottom: "clamp(1rem, 2vw, 3rem)",
          fontSize: "clamp(3rem, 8vw, 12rem)",
        }}
      >
        0%
      </div>
    </div>
  )
}
