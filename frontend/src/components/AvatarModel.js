import { useFrame, useLoader, useThree } from '@react-three/fiber';
import React, { useEffect } from 'react';
import * as THREE from "three";
import {
    GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader';
import { proxy, useSnapshot } from 'valtio';

const modelState = proxy({
    neck: null,
    waist: null,
    possibleAnims: null,
    idle: null,
    currentlyAnimating: false
})
const AvatarModel = props => {
    const { camera, scene, raycaster } = useThree()
    const {
        neck,
        waist,
        possibleAnims,
        idle,
        currentlyAnimating } = useSnapshot(modelState)
    // useFrame((state, delta) => {
    //     const resizeRendererToDisplaySize = (renderer, canvas) => {
    //         let width = window.innerWidth;
    //         let height = window.innerHeight;
    //         let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    //         let canvasPixelHeight = canvas.height / window.devicePixelRatio;

    //         const needResize =
    //             canvasPixelWidth !== width || canvasPixelHeight !== height;
    //         if (needResize) {
    //             renderer.setSize(width, height, false);
    //         }
    //         return needResize;
    //     }
    //     if (resizeRendererToDisplaySize(state.gl, state.scene)) {
    //         state.camera.aspect = state.scene.clientWidth / state.scene.clientHeight;
    //         state.camera.updateProjectionMatrix();
    //     }
    // })
    useEffect(() => {
        function handleOnClick(e) {
            // raycast(raycaster, camera, scene, e, false)
        }
        window.addEventListener('click', handleOnClick);
        return () => {
            window.removeEventListener('click', handleOnClick);
        }
    })

    useEffect(() => {
        function handleTouchEnd(e) {
            raycast(raycaster, camera, scene, e, true)
        }
        window.addEventListener('touchend', handleTouchEnd);
        return () => {
            window.removeEventListener('touchend', handleTouchEnd);
        }
    })

    useEffect(() => {
        function handleMouseMove(e) {
            var mousecoords = getMousePos(e);
            if (neck && waist) {

                moveJoint(mousecoords, neck, 50);
                moveJoint(mousecoords, waist, 30);
            }
        }
        document.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        }
    })
    const raycast = (raycaster, camera, scene, e, touch = false) => {
        var mouse = {};
        if (touch) {
            mouse.x = 2 * (e.changedTouches[0].clientX / window.innerWidth) - 1;
            mouse.y = 1 - 2 * (e.changedTouches[0].clientY / window.innerHeight);
        } else {
            mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
            mouse.y = 1 - 2 * (e.clientY / window.innerHeight);
        }
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // calculate objects intersecting the picking ray
        var intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects[0]) {
            var object = intersects[0].object;

            if (object.name === 'stacy') {

                if (!currentlyAnimating) {
                    modelState.currentlyAnimating = true;
                    playOnClick();
                }
            }
        }
    }

    // Get a random animation, and play it 
    const playOnClick = () => {
        let anim = Math.floor(Math.random() * possibleAnims.length) + 0;
        playModifierAnimation(idle, 0.25, possibleAnims[anim], 0.25);
    }

    const playModifierAnimation = (from, fSpeed, to, tSpeed) => {
        to.setLoop(THREE.LoopOnce);
        to.reset();
        to.play();
        from.crossFadeTo(to, fSpeed, true);
        setTimeout(function () {
            from.enabled = true;
            to.crossFadeTo(from, tSpeed, true);
            currentlyAnimating = false;
        }, to._clip.duration * 1000 - (tSpeed + fSpeed) * 1000);
    }

    const getMousePos = (e) => {
        return { x: e.clientX, y: e.clientY };
    }

    const moveJoint = (mouse, joint, degreeLimit) => {
        let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
        joint.rotation.y = THREE.Math.degToRad(degrees.x);
        joint.rotation.x = THREE.Math.degToRad(degrees.y);
        console.log(joint.rotation.x);
    }

    const getMouseDegrees = (x, y, degreeLimit) => {
        let dx = 0,
            dy = 0,
            xdiff,
            xPercentage,
            ydiff,
            yPercentage;

        let w = { x: window.innerWidth, y: window.innerHeight };

        // Left (Rotates neck left between 0 and -degreeLimit)
        // 1. If cursor is in the left half of screen
        if (x <= w.x / 2) {
            // 2. Get the difference between middle of screen and cursor position
            xdiff = w.x / 2 - x;
            // 3. Find the percentage of that difference (percentage toward edge of screen)
            xPercentage = xdiff / (w.x / 2) * 100;
            // 4. Convert that to a percentage of the maximum rotation we allow for the neck
            dx = degreeLimit * xPercentage / 100 * -1;
        }

        // Right (Rotates neck right between 0 and degreeLimit)
        if (x >= w.x / 2) {
            xdiff = x - w.x / 2;
            xPercentage = xdiff / (w.x / 2) * 100;
            dx = degreeLimit * xPercentage / 100;
        }
        // Up (Rotates neck up between 0 and -degreeLimit)
        if (y <= w.y / 2) {
            ydiff = w.y / 2 - y;
            yPercentage = ydiff / (w.y / 2) * 100;
            // Note that I cut degreeLimit in half when she looks up
            dy = degreeLimit * 0.5 * yPercentage / 100 * -1;
        }
        // Down (Rotates neck down between 0 and degreeLimit)
        if (y >= w.y / 2) {
            ydiff = y - w.y / 2;
            yPercentage = ydiff / (w.y / 2) * 100;
            dy = degreeLimit * yPercentage / 100;
        }
        return { x: dx, y: dy };
    }


    const gltf = useLoader(
        GLTFLoader,
        props.path
    )

    // let stacy_txt = new THREE.TextureLoader().load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy.jpg');
    // stacy_txt.flipY = false;

    // const stacy_mtl = new THREE.MeshPhongMaterial({
    //     map: stacy_txt,
    //     color: 0xffffff,
    //     skinning: true
    // });

    // let model = gltf.scene;
    // let fileAnimations = gltf.animations;

    // model.traverse(o => {

    //     if (o.isMesh) {
    //         o.castShadow = true;
    //         o.receiveShadow = true;
    //         o.material = stacy_mtl;
    //     }
    //     // Reference the neck and waist bones
    //     if (o.isBone && o.name === 'mixamorigNeck') {
    //         modelState.neck = o;
    //     }
    //     if (o.isBone && o.name === 'mixamorigSpine') {
    //         modelState.waist = o;
    //     }
    // });

    // model.scale.set(7, 7, 7);
    // model.position.y = -11;

    // let mixer = new THREE.AnimationMixer(model);

    // let clips = fileAnimations.filter(val => val.name !== 'idle');
    // modelState.possibleAnims = clips.map(val => {
    //     let clip = THREE.AnimationClip.findByName(clips, val.name);

    //     clip.tracks.splice(3, 3);
    //     clip.tracks.splice(9, 3);

    //     clip = mixer.clipAction(clip);
    //     return clip;
    // });


    // let idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'idle');

    // idleAnim.tracks.splice(3, 3);
    // idleAnim.tracks.splice(9, 3);

    // modelState.idle = mixer.clipAction(idleAnim);
    // modelState.idle.play();

    // Here's the animation part
    // // ************************* 
    // let mixer
    // if (gltf.animations.length) {
    //     mixer = new THREE.AnimationMixer(gltf.scene);
    //     gltf.animations.forEach(clip => {
    //         const action = mixer.clipAction(clip)
    //         action.play();
    //     });
    // }

    // useFrame((state, delta) => {
    //     mixer?.update(delta)
    // })
    // // *************************

    // gltf.scene.traverse(child => {
    //     if (child.isMesh) {
    //         child.castShadow = true
    //         child.receiveShadow = true
    //         child.material.side = THREE.FrontSide
    //     }
    // })
    // gltf.scene.scale.set(7, 7, 7);
    // gltf.scene.position.y = -11;

    return (
        <primitive
            object={gltf.scene}
            scale={props.scale}
        />
    )
}

export default AvatarModel;