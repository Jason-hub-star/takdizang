import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { RemotionInputProps } from "@/types";

export function ShortformComposition({
  title,
  scenes,
  bgmMetadata,
  orientation,
}: RemotionInputProps & { orientation: "9:16" | "1:1" | "16:9" }) {
  const { fps } = useVideoConfig();
  const activeScenes = scenes.length > 0 ? scenes : [];
  const titleFrames = 18;
  let cursor = titleFrames;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #fbf8f4 0%, #f1ebe4 100%)",
        color: "#201A17",
        fontFamily: "sans-serif",
      }}
    >
      {bgmMetadata.src ? <Audio src={bgmMetadata.src} volume={0.45} /> : null}

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: orientation === "9:16" ? 72 : 56,
        }}
      >
        <TitleCard title={title} />
      </AbsoluteFill>

      {activeScenes.map((scene) => {
        const durationInFrames = Math.max(30, Math.round((scene.durationMs / 1000) * fps));
        const from = cursor;
        cursor += durationInFrames;

        return (
          <Sequence key={`${scene.imageSlot}-${from}`} from={from} durationInFrames={durationInFrames}>
            <SceneCard
              headline={scene.headline}
              body={scene.body}
              imageSrc={scene.imageSrc}
              orientation={orientation}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

function TitleCard({ title }: { title: string }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const scale = spring({ fps: 30, frame, config: { damping: 12, stiffness: 90 } });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${0.96 + scale * 0.04})`,
        background: "rgba(255,255,255,0.92)",
        borderRadius: 40,
        padding: "32px 36px",
        maxWidth: 920,
        textAlign: "center",
        boxShadow: "0 28px 80px rgba(32,26,23,0.08)",
      }}
    >
      <div style={{ fontSize: 24, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8D7D70" }}>
        Shortform Preview
      </div>
      <div style={{ marginTop: 18, fontSize: 68, lineHeight: 1.08, fontWeight: 700 }}>
        {title || "Takdi Shortform"}
      </div>
    </div>
  );
}

function SceneCard({
  headline,
  body,
  imageSrc,
  orientation,
}: {
  headline: string;
  body: string;
  imageSrc?: string;
  orientation: "9:16" | "1:1" | "16:9";
}) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const mediaHeight = orientation === "16:9" ? 620 : orientation === "1:1" ? 540 : 980;

  return (
    <AbsoluteFill style={{ padding: orientation === "9:16" ? 64 : 56 }}>
      <div
        style={{
          display: "grid",
          gridTemplateRows: imageSrc ? `${mediaHeight}px auto` : "1fr",
          gap: 28,
          height: "100%",
          opacity,
        }}
      >
        {imageSrc ? (
          <div
            style={{
              overflow: "hidden",
              borderRadius: 40,
              background: "#e7ddd2",
              boxShadow: "0 28px 80px rgba(32,26,23,0.12)",
            }}
          >
            <Img
              src={imageSrc}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${1.02 + frame * 0.0008})`,
              }}
            />
          </div>
        ) : null}

        <div
          style={{
            background: "rgba(255,255,255,0.94)",
            borderRadius: 36,
            padding: orientation === "9:16" ? "28px 32px" : "24px 28px",
            boxShadow: "0 22px 64px rgba(32,26,23,0.08)",
          }}
        >
          <div style={{ fontSize: orientation === "16:9" ? 46 : 54, fontWeight: 700, lineHeight: 1.12 }}>
            {headline}
          </div>
          <div style={{ marginTop: 16, fontSize: orientation === "16:9" ? 24 : 28, lineHeight: 1.5, color: "#4D433D" }}>
            {body}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
