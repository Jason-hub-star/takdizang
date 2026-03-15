import React from "react";
import { Composition } from "remotion";
import { TakdiVideo916 } from "./TakdiVideo916";
import { TakdiVideo1x1 } from "./TakdiVideo1x1";
import { TakdiVideo169 } from "./TakdiVideo169";
import type { RemotionInputProps } from "../types";

const defaultProps: RemotionInputProps = {
  title: "",
  sections: [],
  selectedImages: [],
  scenes: [],
  bgmMetadata: { src: "" },
  templateKey: "9:16",
  totalDurationFrames: 150,
};

// Remotion Composition expects LooseComponentType — cast needed without zod schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asComp = (c: React.FC<RemotionInputProps>) => c as any;

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="TakdiVideo-916"
        component={asComp(TakdiVideo916)}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={150}
        defaultProps={{ ...defaultProps, templateKey: "9:16" }}
      />
      <Composition
        id="TakdiVideo-1x1"
        component={asComp(TakdiVideo1x1)}
        width={1080}
        height={1080}
        fps={30}
        durationInFrames={150}
        defaultProps={{ ...defaultProps, templateKey: "1:1" }}
      />
      <Composition
        id="TakdiVideo-169"
        component={asComp(TakdiVideo169)}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={150}
        defaultProps={{ ...defaultProps, templateKey: "16:9" }}
      />
    </>
  );
};
