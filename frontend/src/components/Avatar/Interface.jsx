import { Affix, Button, Stack } from "@mantine/core";
import { useCharacterAnimations } from "./CharacterAnimations";

const Interface = () => {
  const { animations, animationIndex, setAnimationIndex } =
    useCharacterAnimations();
  return (
    <Affix position={{ bottom: 50, right: 20 }}>
      <div style={{ maxHeight: "650px", overflowY: "scroll" }}>
        <Stack>
          {animations.map((animation, index) => (
            <Button
              key={animation}
              variant={index === animationIndex ? "filled" : "light"}
              onClick={() => setAnimationIndex(index)}
            >
              {animation}
            </Button>
          ))}
        </Stack>
      </div>
    </Affix>
  );
};

export default Interface;
