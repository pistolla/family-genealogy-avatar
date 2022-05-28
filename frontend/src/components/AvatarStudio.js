import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { Suspense, useRef } from 'react';
import AvatarModel from "./AvatarModel";

function Floor() {
    const ref = useRef()
    useFrame((state, delta) => {
        ref.current.rotation.x = -0.5 * Math.PI
        ref.current.position.y = -11
    });
    return (
        <mesh ref={ref} receiveShadow >
            <planeGeometry attach="geometry" args={[5000, 5000, 1, 1]} />
            <meshPhongMaterial attach="material" args={[{ color: "#eeeeee", shininess: 0 }]} />
        </mesh>
    )
}

function Sphere() {
    const ref = useRef()
    return (
        <mesh ref={ref} position={[-0.25, -2.5, -15]}>
            <sphereGeometry attach="geometry" args={[8, 32, 32]} />
            <meshBasicMaterial attach="material" color="#9bffaf" />
        </mesh>
    )
}

function Controls() {
    const orbitRef = useRef()
    const { camera, gl } = useThree()

    useFrame(() => {
        orbitRef.current.update()
    })

    return (
        <orbitControls
            autoRotate
            maxPolarAngle={Math.PI / 3}
            minPolarAngle={Math.PI / 3}
            args={[camera, gl.domElement]}
            ref={orbitRef}
        />
    )
}


function AvatarStudio({ ...props }) {
    const ref = useRef()

    return (
        <Canvas
            ref={ref}
            camera={{ args: [50, window.innerWidth / window.innerHeight, 0.1, 1000], position: [0, -3, 30], fov: 50 }}
            gl={{ antialias: true}}
            dpr={window.devicePixelRatio}>
            <color attach="background" args={["#f1f1f1"]} />
            <fog attach="fog" color="#f1f1f1" near={60} far={100} />
            <hemisphereLight skyColor={"#ffffff"} groundColor={"#ffffff"} intensity={0.61} position={[0, 50, 0]} />
            <directionalLight
                color={"#ffffff"}
                intensity={0.54}
                castShadow
                shadow-mapSize-height={1024}
                shadow-mapSize-width={1024}
                position={[-8, 12, 8]}
                shadow-camera-left={-8.25}
                shadow-camera-right={8.25}
                shadow-camera-top={8.25}
                shadow-camera-bottom={-8.25}
                shadow-camera-near={0.1}
                shadow-camera-far={1500}
            />
            <Floor />
            <Sphere />
            <Suspense fallback={null}>
                <AvatarModel path='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb' />
            </Suspense>
        </Canvas>
    );
}

export default AvatarStudio;