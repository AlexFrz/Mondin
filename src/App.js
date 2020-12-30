//Components
import React, { Suspense, useEffect, useRef, useState } from "react";
import "./App.scss";

import { gsap, TweenMax, TimelineMax } from "gsap";

import { Canvas, extend } from "react-three-fiber";
import { useFrame } from "react-three-fiber";
import { useInView } from "react-intersection-observer";
import { Section } from "./components/section";


// Page State
import state from "./components/state";
import { Html, useProgress, useGLTFLoader } from "drei";
import { a, useTransition } from "@react-spring/web";

// Intersection observer

import Header from "./components/header";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: {
    opacity: 0,
    x: "100vw",
  },
  visible: {
    opacity: 1,
    x: 0,
  },
  transition: {
    type: "spring",
    delay: 0.5,
  },
  exit: {
    x: "-100vw",
    transition: { ease: "easeInOut" },
  },
};

export const Model = ({ modelPath }) => {
  const gltf = useGLTFLoader(modelPath, true);

  return <primitive object={gltf.scene} dispose={null} />;
};

export const Lights = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.1} color={0xc4c4c4}/>
      <directionalLight position={[0, 10, 0]} intensity={0.2} color={0xc4c4c4}/>
      <directionalLight position={[-20, 20, 0]} intensity={0.2} color={0xc4c4c4} />
     
      <pointLight position={[0, 100, -500]} intensity={0.3} color={0xc4c4c4} />
    </>
  );
};

export const HTMLContent = ({
  bgColor,
  domContent,
  children,
  modelPath,
  positionY,
  positionZ,
  positionX,
  meshY,
  scale,
  HTMLPosition,
}) => {
  const ref = useRef();
  useFrame(() => (ref.current.rotation.y += 0.01));
  const [refItem, inView] = useInView({
    threshold: 0,
  });

  useEffect(() => {
    inView && (document.body.style.background = bgColor);
  }, [inView]);
  return (
    <Section factor={1} offset={1}>
      <group position={[positionX, positionY, positionZ]} className="z-index">
        <Html portal={domContent} fullscreen position={HTMLPosition}>
          <motion.div
            className="container"
            ref={refItem}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children}
          </motion.div>
        </Html>
        <mesh ref={ref} position={[meshY ? meshY : -50, -50, 25]} scale={scale}>
          <Model modelPath={modelPath} />
        </mesh>
      </group>
    </Section>
  );
};

function Loader() {
  const { active, progress } = useProgress();
  const transition = useTransition(active, {
    from: { opacity: 1, progress: 0 },
    leave: { opacity: 0 },
    update: { progress },
  });
  return transition(
    ({ progress, opacity }, active) =>
      active && (
        <a.div className="loading" style={{ opacity }}>
          <div className="loading-bar-container">
            <a.div className="loading-bar" style={{ width: progress }}></a.div>
          </div>
        </a.div>
      )
  );
}

export default function App() {
  const domContent = useRef();
  const scrollArea = useRef();
  const onScroll = (e) => {
    state.top.current = e.target.scrollTop;
  };
  const [hiden, setHiden] = useState(false);

  useEffect(
    () => void onScroll({ target: scrollArea.current }, setHiden(true)),
    []
  );
  return (
    <>
      <Header />
      <div className="one-sentence" >
        <h1>
          L'éthique et le luxe
          <br />
          <span>ne font plus qu'un.</span>
        </h1>
      </div>
      <Canvas colorManagement camera={{ position: [150, 0, 0], fov: 70 }}>
        <Lights />
        <Suspense fallback={null}>
          <HTMLContent
            domContent={domContent}
            modelPath="/apple/scene.gltf"
            positionY={225}
            positionX={40}
            positionZ={-20}
            bgColor={"#3c0c10"}
            scale={[15, 15, 15]}
          >
            <motion.section
              className="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            ></motion.section>
          </HTMLContent>
        </Suspense>
      </Canvas>
      <Loader />
      <div ref={scrollArea} className="scrollArea" onScroll={onScroll}>
        <div style={{ position: "sticky", top: 0 }} ref={domContent}></div>
        <div style={{ height: `${state.sections * 100}vh` }}></div>
      </div>
    </>
  );
}
