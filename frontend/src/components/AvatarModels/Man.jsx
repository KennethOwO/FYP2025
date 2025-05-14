import React, { useEffect, useRef, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import glosses from "../../../public/glosses/gloss.json";
import { useTranslation } from "react-i18next";

const Man = ({
  props,
  animationKeyword,
  speed = 1,
  showSkeleton,
  repeat,
  isPaused,
  updateCurrentAnimationName = () => {},
  updateCurrentSignFrame = () => {},
  updateStatus = () => {},
}) => {
  const { t, i18n } = useTranslation();
  const group = useRef();
  const skeletonHelperRef = useRef(null);
  const { nodes, materials, animations } = useGLTF("/models/man.glb");
  const { actions } = useAnimations(animations, group);

  const [animationQueue, setAnimationQueue] = useState([]);
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
  const [prevAnimationKeyword, setPrevAnimationKeyword] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  // let timerShouldRun = true; // Flag to control timer execution
  const frameRate = 30;

  useEffect(() => {
    if (!animationKeyword) {
      // Reset everything when animationKeyword is empty/null
      setAnimationQueue([]);
      setCurrentAnimationIndex(0);
      setPrevAnimationKeyword(null);
      updateCurrentSignFrame(null);
      return;
    }
    if (animationKeyword !== prevAnimationKeyword) {
      const sanitizedAnimationKeyword = animationKeyword.replace(/\+/g, " ");
      const animationKeywords = sanitizedAnimationKeyword.split(" ");
      let newAnimationQueue = [];
      let newSignFrames = [];

      for (let i = animationKeywords.length; i >= 1; i--) {
        const combinedKeyword = animationKeywords
          .slice(0, i)
          .join(" ")
          .toUpperCase();
        const animationData = glosses.find(
          (item) => item.keyword === combinedKeyword
        );

        if (animationData) {
          newAnimationQueue.push(...animationData.animations);
          newSignFrames.push(animationData.frames);
          animationKeywords.splice(0, i);
          i = animationKeywords.length + 1;
        }
      }

      animationKeywords.forEach((keyword) => {
        const singleKeyword = keyword.toUpperCase();
        const animationData = glosses.find(
          (item) => item.keyword === singleKeyword
        );
        if (animationData) {
          newAnimationQueue.push(...animationData.animations);
          newSignFrames.push(animationData.frames);
        }
      });

      setAnimationQueue(newAnimationQueue);
      setCurrentAnimationIndex(0);
      setPrevAnimationKeyword(animationKeyword);

      if (newSignFrames.length > 0) {
        updateCurrentSignFrame(newSignFrames[0]);
      }
    }
  }, [animationKeyword, prevAnimationKeyword, updateCurrentSignFrame]);

  useEffect(() => {
    if (animationQueue.length === 0) {
      updateStatus(t("avatar_idle"));
    } else if (isPaused) {
      updateStatus(t("avatar_pause"));
    } else if (animationQueue.length > 0) {
      updateStatus(t("avatar_playing"));
    }
  }, [animationQueue, isPaused, updateStatus]);

  const onAnimationFinished = () => {
    if (currentAnimationIndex < animationQueue.length - 1) {
      setCurrentAnimationIndex((prevIndex) => prevIndex + 1);
      // stopTimer();
    } else if (repeat === "Yes") {
      setTimeout(() => {
        setAnimationQueue([]);
        setCurrentAnimationIndex(0);
        setPrevAnimationKeyword(null);
      }, 2000);
    }
    // else if(currentAnimationIndex === animationQueue.length - 1){
    //   timerShouldRun = false; // Stop the timer
    //   stopTimer();
    // }
  };

  useEffect(() => {
    const playNextAnimation = () => {
      const animationName = animationQueue[currentAnimationIndex];
      const nextAction = actions[animationName];

      if (nextAction) {
        if (speed) {
          nextAction.setEffectiveTimeScale(speed);
        }
        // if(timerShouldRun){
        //   startTimer(); // Start the timer
        // }
        // console.log("testing123");
        nextAction.reset().fadeIn(0.5).play();
        nextAction.setLoop(THREE.LoopOnce);
        nextAction.getMixer().addEventListener("finished", onAnimationFinished);
        nextAction.clampWhenFinished = true;

        setCurrentAction(nextAction);

        updateCurrentAnimationName(animationName);

        const animationData = glosses.find((item) =>
          item.animations.includes(animationName)
        );
        if (animationData) {
          updateCurrentSignFrame(animationData.frames);
        }
      }
    };

    if (!isPaused && animationQueue.length > 0) {
      playNextAnimation();
    }

    return () => {
      const animationName = animationQueue[currentAnimationIndex];
      const nextAction = actions[animationName];

      if (nextAction) {
        nextAction.fadeOut(0.5);
        nextAction
          .getMixer()
          .removeEventListener("finished", onAnimationFinished);
      }
    };
  }, [animationQueue, currentAnimationIndex, actions, speed, isPaused]);

  useEffect(() => {
    if (currentAction) {
      currentAction.paused = isPaused;
    }
  }, [isPaused, currentAction]);

  useEffect(() => {
    if (showSkeleton && !skeletonHelperRef.current) {
      const helper = new THREE.SkeletonHelper(group.current);
      group.current.parent.add(helper);
      skeletonHelperRef.current = helper;
    } else if (!showSkeleton && skeletonHelperRef.current) {
      group.current.parent.remove(skeletonHelperRef.current);
      skeletonHelperRef.current = null;
    }
  }, [showSkeleton]);

  // async function startTimer() {
  //   return new Promise((resolve) => {
  //     let startTime = Date.now();

  //     const timerInterval = setInterval(() => {
  //       if (!timerShouldRun) {
  //         clearInterval(timerInterval); // Stop the timer if flag is false
  //         resolve(); // Resolve the promise
  //         return;
  //       }
  //       const elapsedTime = Date.now() - startTime;
  //       const seconds = Math.floor(elapsedTime / 1000);
  //       const milliseconds = Math.floor(elapsedTime % 1000);
  //     }, 100); // Update the counter every 100 milliseconds (0.1 second)
  //   });
  // }

  // async function stopTimer(timerInterval) {
  //   clearInterval(timerInterval);
  // }

  return (
    <group ref={group} {...props} dispose={null} position={[0, 0, 0]}>
      <group name="Scene" position={[-10, 0, 0]}>
        <group name="Armature" rotation={[0, 0, 0]} scale={100}>
          <primitive object={nodes.Hips} />
          <group name="EyeAO_Mesh" />
          <group name="EyeAO_Mesh001" />
          <group name="EyeAO_Mesh146" />
          <group name="Eyelash_Mesh" />
          <group name="Eyelash_Mesh001" />
          <group name="Eyelash_Mesh146" />
          <group name="Head_Mesh" />
          <group name="Head_Mesh001" />
          <group name="Head_Mesh146" />
          <group name="Teeth_Mesh" />
          <group name="Teeth_Mesh001" />
          <group name="Teeth_Mesh146" />
          <group name="Tongue_Mesh" />
          <group name="Tongue_Mesh001" />
          <group name="Tongue_Mesh146" />
          <skinnedMesh
            name="avaturn_hair_0"
            geometry={nodes.avaturn_hair_0.geometry}
            material={materials["avaturn_hair_0_material.146"]}
            skeleton={nodes.avaturn_hair_0.skeleton}
          />
          <skinnedMesh
            name="avaturn_hair_1"
            geometry={nodes.avaturn_hair_1.geometry}
            material={materials["avaturn_hair_1_material.146"]}
            skeleton={nodes.avaturn_hair_1.skeleton}
          />
          <skinnedMesh
            name="avaturn_look_0"
            geometry={nodes.avaturn_look_0.geometry}
            material={materials["avaturn_look_0_material.146"]}
            skeleton={nodes.avaturn_look_0.skeleton}
          />
          <skinnedMesh
            name="avaturn_shoes_0"
            geometry={nodes.avaturn_shoes_0.geometry}
            material={materials["avaturn_shoes_0_material.146"]}
            skeleton={nodes.avaturn_shoes_0.skeleton}
          />
          <skinnedMesh
            name="Body_Mesh"
            geometry={nodes.Body_Mesh.geometry}
            material={materials["Body.146"]}
            skeleton={nodes.Body_Mesh.skeleton}
          />
          <skinnedMesh
            name="Eye_Mesh"
            geometry={nodes.Eye_Mesh.geometry}
            material={materials["Eyes.146"]}
            skeleton={nodes.Eye_Mesh.skeleton}
            morphTargetDictionary={nodes.Eye_Mesh.morphTargetDictionary}
            morphTargetInfluences={nodes.Eye_Mesh.morphTargetInfluences}
          />
          <skinnedMesh
            name="EyeAO_Mesh002"
            geometry={nodes.EyeAO_Mesh002.geometry}
            material={materials["EyeAO.146"]}
            skeleton={nodes.EyeAO_Mesh002.skeleton}
            morphTargetDictionary={nodes.EyeAO_Mesh002.morphTargetDictionary}
            morphTargetInfluences={nodes.EyeAO_Mesh002.morphTargetInfluences}
          />
          <skinnedMesh
            name="Eyelash_Mesh002"
            geometry={nodes.Eyelash_Mesh002.geometry}
            material={materials["Eyelash.146"]}
            skeleton={nodes.Eyelash_Mesh002.skeleton}
            morphTargetDictionary={nodes.Eyelash_Mesh002.morphTargetDictionary}
            morphTargetInfluences={nodes.Eyelash_Mesh002.morphTargetInfluences}
          />
          <skinnedMesh
            name="Head_Mesh002"
            geometry={nodes.Head_Mesh002.geometry}
            material={materials["Head.146"]}
            skeleton={nodes.Head_Mesh002.skeleton}
            morphTargetDictionary={nodes.Head_Mesh002.morphTargetDictionary}
            morphTargetInfluences={nodes.Head_Mesh002.morphTargetInfluences}
          />
          <skinnedMesh
            name="Teeth_Mesh002"
            geometry={nodes.Teeth_Mesh002.geometry}
            material={materials["Teeth.292"]}
            skeleton={nodes.Teeth_Mesh002.skeleton}
            morphTargetDictionary={nodes.Teeth_Mesh002.morphTargetDictionary}
            morphTargetInfluences={nodes.Teeth_Mesh002.morphTargetInfluences}
          />
          <skinnedMesh
            name="Tongue_Mesh002"
            geometry={nodes.Tongue_Mesh002.geometry}
            material={materials["Teeth.293"]}
            skeleton={nodes.Tongue_Mesh002.skeleton}
            morphTargetDictionary={nodes.Tongue_Mesh002.morphTargetDictionary}
            morphTargetInfluences={nodes.Tongue_Mesh002.morphTargetInfluences}
          />
        </group>
      </group>
    </group>
  );
};

export default Man;
