import { Canvas, useFrame } from '@react-three/fiber';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-converter';
import * as tf from '@tensorflow/tfjs-core';
import CameraControls from 'camera-controls';
import React, { useRef } from "react";
import * as THREE from 'three';
import { proxy, useSnapshot } from 'valtio';

CameraControls.install({ THREE: THREE });

const RENDERER_WIDTH = 192, RENDERER_HEIGHT = 256;
const IMAGE_WIDTH = 192, IMAGE_HEIGHT = 256;
const INVALID_DEPTH_THRES = 0.1;
const INVALID_DEPTH = 10000;
const PLANE_SIZE = 0.025;
const FOV = 27;
const VERTEX_SHADER_3D_PHOTO = `
precision highp float;
uniform vec3 iResolution; // viewport resolution (in pixels)
varying vec2 fragCoord, vUv;
varying vec4 mvPosition;
void main() {
  vUv = uv;
	fragCoord = vec2(uv.x * iResolution.x, uv.y * iResolution.y);
  mvPosition = modelViewMatrix * vec4(position, 1.0);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const FRAGMENT_SHADER_3D_PHOTO = `
precision highp float;
uniform sampler2D iChannel0, iChannel1;
uniform mat4 uTextureProjectionMatrix;
uniform vec3 iResolution;
uniform vec4 iMouse;
varying vec2 fragCoord;
varying vec4 mvPosition;
out vec4 fragColor;
void main()
{
  vec2 uv = fragCoord.xy / iResolution.xy;
  fragColor = vec4(texture(iChannel1, uv).rgb, 1.0);
}
`;

/**
 * Returns a pair of transform from an interval to another interval.
 * @param {number} fromMin - min of the start interval.
 * @param {number} fromMax - max of the start interval.
 * @param {number} toMin - min of the ending interval.
 * @param {number} toMax - max of the ending interval.
 */
const transformValueRange = (fromMin, fromMax, toMin, toMax) => {
	console.log('transformValueRange()')
	const fromRange = fromMax - fromMin;
	const ToRange = toMax - toMin;
	const scale = ToRange / fromRange;
	const offset = toMin - fromMin * scale;
	return { scale, offset };
}

const getDepth = (depthData, vid) => {
	console.log("getDepth()")
	console.log(depthData)
	if(!depthData){
		return INVALID_DEPTH;
	}
	// vid: vertex id.
	const depth0 = depthData[vid * 4 + 0];
	const depth1 = depthData[vid * 4 + 1];
	const depth2 = depthData[vid * 4 + 2];
	let depth = depth0 * 255 * 255 + depth1 * 255 + depth2;
	depth = depth / 255 / 255 / 255;
	if (isNaN(depth)) {
		depth = 0;
	}
	if (depth <= INVALID_DEPTH_THRES) depth = INVALID_DEPTH;
	return depth;
}

const getIndices = (depthData) => {
	let indices = [];
	for (let i = 0; i < IMAGE_HEIGHT; i++) {
		for (let j = 0; j < IMAGE_WIDTH; j++) {
			const a = i * (IMAGE_WIDTH + 1) + (j + 1);
			const b = i * (IMAGE_WIDTH + 1) + j;
			const c = (i + 1) * (IMAGE_WIDTH + 1) + j;
			const d = (i + 1) * (IMAGE_WIDTH + 1) + (j + 1);

			let aDepth = getDepth(depthData, i * IMAGE_WIDTH + j + 1);
			let bDepth = getDepth(depthData, i * IMAGE_WIDTH + j);
			let cDepth = getDepth(depthData, (i + 1) * IMAGE_WIDTH + j);
			let dDepth = getDepth(depthData, (i + 1) * IMAGE_WIDTH + j + 1);
			// generate two faces (triangles) per iteration

			if (aDepth != INVALID_DEPTH && bDepth != INVALID_DEPTH &&
				dDepth != INVALID_DEPTH) {
				indices.push(a, b, d);  // face one
			}

			if (bDepth != INVALID_DEPTH && cDepth != INVALID_DEPTH &&
				dDepth != INVALID_DEPTH) {
				indices.push(b, c, d);  // face two
			}
		}
	}

	return indices;
}

const predictorState = proxy({
	segmentationModel: null,
	segmenter: null,
	estimationModel: null,
	estimator: null,
	depthData: null,
	vertices: [],
	depthMaterial: {},
	requireUpdate: false,
	uvs: [],
	colors: [],
	normals: [],
	indices: [],
});

function Generate3D({ image, active, nextStep, goBack }) {
	console.log("Generate3d")
	const {
		segmentationModel,
		segmenter,
		estimationModel,
		estimator,
		depthData,
		vertices,
		uvs,
		colors,
		normals } = useSnapshot(predictorState);
	const masked = useRef()
	const proceed = e => {
		e.preventDefault();
		nextStep();
	};
	const revert = e => {
		e.preventDefault();
		goBack();
	};

	

	// useLayoutEffect(() => {
	// 	console.log("useLayoutEffect")
	// 	for (let i = 0; i <= IMAGE_HEIGHT; ++i) {
	// 		const y = i - IMAGE_HEIGHT * 0.5;
	// 		for (let j = 0; j <= IMAGE_WIDTH; ++j) {
	// 			const x = j - IMAGE_WIDTH * 0.5;

	// 			const vid = i * IMAGE_WIDTH + j;
	// 			let depth = getDepth(depthData, vid);

	// 			predictorState.vertices.push(
	// 				x * 0.025, -y * 0.025,
	// 				depth * -5.0);
	// 				predictorState.normals.push(0, 0, 1);

	// 			const r = (x / IMAGE_WIDTH) + 0.5;
	// 			const g = (y / IMAGE_HEIGHT) + 0.5;
	// 			predictorState.colors.push(r, g, 1);

	// 			predictorState.uvs.push(j / IMAGE_WIDTH, 1.0 - i / IMAGE_HEIGHT);
	// 		}
	// 	}
	// 	predictorState.indices = getIndices(depthData);
	// })
	// Load Image in img

	// useEffect(() => {
	// 	console.log('useEffect()')
	// 	const initEstimator = async () => {
	// 		console.log("initEstimator()")
	// 		try {
	// 			segmentationModel =
	// 				bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
	// 		} catch (e) {
	// 			console.log('Error in loading segmentation model.');
	// 		}
	// 		try {
	// 			segmenter = await bodySegmentation.createSegmenter(
	// 				segmentationModel, { runtime: 'tfjs' });
	// 			estimationModel = depthEstimation.SupportedModels.ARPortraitDepth;
	// 		} catch (e) {
	// 			console.log('Error in loading estimation model.');
	// 		}
	// 		estimator = await depthEstimation.createEstimator(estimationModel);
	// 		predict();
	// 	}
	// 	console.log(image)
	// 	if (image) {
	// 		initEstimator();
	// 	}
	// }, [])

	/**
	 * Runs the model.
	 */
	const predict = () => {
		console.log('predict()')
		// Tests if the model is loaded.
		if (segmentationModel == null || segmenter == null ||
			estimationModel == null || estimator == null) {
			alert('Model is not available!');
			return;
		}

		// Tests if an image is missing.
		if (!image) {
			alert('You need to upload an image!');
			return;
		}


		// predictButton.textContent = 'Running...';
		// predictButton.disabled = true;

		// Sets timeout = 0 to force reload the UI.
		setTimeout(function () {
			const start = Date.now();
			// const ctx = resultCanvas.getContext('2d');
			// ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);

			const getPortraitDepth = async () => {
				console.log('getPortraitDepth')
				const segmentation = await segmenter.segmentPeople(image);

				// Convert the segmentation into a mask to darken the background.
				const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
				const backgroundColor = { r: 0, g: 0, b: 0, a: 255 };
				const backgroundDarkeningMask = await bodySegmentation.toBinaryMask(
					segmentation, foregroundColor, backgroundColor);
				segmentation.map(
					singleSegmentation => singleSegmentation.mask.toTensor().then(
						tensor => tensor.dispose()));

				const opacity = 1.0;
				const maskBlurAmount = 0;
				const flipHorizontal = false;

				// Draw the mask onto the image on a canvas.  With opacity set to 0.7
				// and maskBlurAmount set to 3, this will darken the background and blur
				// the darkened background's edge.
				await bodySegmentation.drawMask(
					masked, image, backgroundDarkeningMask, opacity, maskBlurAmount,
					flipHorizontal);

				const result = await estimator.estimateDepth(
					image, { minDepth: 0.2, maxDepth: 0.9 });
				const depthMap = await result.toTensor();

				tf.tidy(() => {
					const depthMap3D = tf.expandDims(depthMap, 2);
					const transformNormalize =
						transformValueRange(0, 1, 0, 255 * 255 * 255);
					let depth_rescale = tf.add(
						tf.mul(depthMap3D, transformNormalize.scale),
						transformNormalize.offset);

					let depth_r = tf.floorDiv(depth_rescale, 255.0 * 255.0);
					let depth_remain =
						tf.floorDiv(tf.mod(depth_rescale, 255.0 * 255.0), 1.0);
					let depth_g = tf.floorDiv(depth_remain, 255);
					let depth_b = tf.floorDiv(tf.mod(depth_remain, 255), 1.0);

					let depth_rgb = tf.concat([depth_r, depth_g, depth_b], 2);

					// Renders the result on a canvas.
					const transformBack = transformValueRange(0, 255, 0, 1);

					// Converts back to 0-1.
					const rgbFinal = tf.clipByValue(
						tf.add(
							tf.mul(depth_rgb, transformBack.scale), transformBack.offset),
						0, 1);
					predictorState.depthData = rgbFinal;
					// tf.browser.toPixels(rgbFinal, resultCanvas);
				});

				depthMap.dispose();

				const end = Date.now();
				// perf.textContent = `E2E latency: ${time}ms`;
				// predictButton.textContent = 'Measure Latency';
				// predictButton.disabled = false;

				setTimeout(() => {
					for (let i = 0; i <= IMAGE_HEIGHT; ++i) {
						for (let j = 0; j <= IMAGE_WIDTH; ++j) {
							const vid = i * IMAGE_WIDTH + j;
							let depth = getDepth(depthData, vid);
							const vid2 = i * (IMAGE_WIDTH + 1) + j;
							vertices[vid2 * 3 + 2] = depth * -5.0;
						}
					}
					predictorState.indices = getIndices(predictorState.depthData);
					predictorState.requireUpdate = true;

				}, 500);
			};
			getPortraitDepth();
		}, 0);
	}


	return (
		<div className={`form__card ${active ? 'active' : ''}`}>
			<div className="form__design_avatar">
				<div className="form__design_avatar-media">
					<img id="uploaded" className="img-avatar" src="" />
				</div>
				<div className="form__design_avatar-media" style={{ position: "relative", width: RENDERER_WIDTH, height: RENDERER_HEIGHT }}>
					<Canvas
						ref={masked}
						camera={{ args: [FOV, RENDERER_WIDTH / RENDERER_HEIGHT, 0.001, 3500], position: [0, 0, 7], fov: FOV, aspect: RENDERER_WIDTH / RENDERER_HEIGHT }}
						gl={{ antialias: true, preserveDrawingBuffer: true }}
						dpr={window.devicePixelRatio}>
						<color attach="background" args={["#050505"]} />
						<Background />
						<Box />
					</Canvas>
				</div>
			</div>
			<div className="btn__container">
				<button className="btn btn-svg reverse" onClick={revert}>
					<svg className="svg-icon" viewBox="0 0 20 20">
						<path
							fill="none"
							d="M18.271,9.212H3.615l4.184-4.184c0.306-0.306,0.306-0.801,0-1.107c-0.306-0.306-0.801-0.306-1.107,0
							L1.21,9.403C1.194,9.417,1.174,9.421,1.158,9.437c-0.181,0.181-0.242,0.425-0.209,0.66c0.005,0.038,0.012,0.071,0.022,0.109
							c0.028,0.098,0.075,0.188,0.142,0.271c0.021,0.026,0.021,0.061,0.045,0.085c0.015,0.016,0.034,0.02,0.05,0.033l5.484,5.483
							c0.306,0.307,0.801,0.307,1.107,0c0.306-0.305,0.306-0.801,0-1.105l-4.184-4.185h14.656c0.436,0,0.788-0.353,0.788-0.788
							S18.707,9.212,18.271,9.212z"
						/>
					</svg>
				</button>
				<button className="btn btn-svg" onClick={proceed}>
					<svg className="svg-icon" viewBox="0 0 20 20">
						<path
							fill="none"
							d="M1.729,9.212h14.656l-4.184-4.184c-0.307-0.306-0.307-0.801,0-1.107c0.305-0.306,0.801-0.306,1.106,0
							l5.481,5.482c0.018,0.014,0.037,0.019,0.053,0.034c0.181,0.181,0.242,0.425,0.209,0.66c-0.004,0.038-0.012,0.071-0.021,0.109
							c-0.028,0.098-0.075,0.188-0.143,0.271c-0.021,0.026-0.021,0.061-0.045,0.085c-0.015,0.016-0.034,0.02-0.051,0.033l-5.483,5.483
							c-0.306,0.307-0.802,0.307-1.106,0c-0.307-0.305-0.307-0.801,0-1.105l4.184-4.185H1.729c-0.436,0-0.788-0.353-0.788-0.788
							S1.293,9.212,1.729,9.212z"
						/>
					</svg>
				</button>
			</div>
		</div>
	);
}


function Box(props) {
	const mesh = useRef()
	const canvasRef = useRef(document.getElementsByName("canvas"));
	const imgRef = useRef(document.getElementById("uploaded"))
	console.log(canvasRef)
	console.log(imgRef)
	useFrame(() => {
		if (mesh.current && predictorState.requireUpdate && predictorState.vertices) {
			// manually inject numbers into property. so that it won't trigger re-render.
			const pos = mesh.current.geometry.getAttribute('position');
			for (let i = 0; i <= predictorState.vertices.length; i++) {
				pos.array[i] = predictorState.vertices[i]
			}
			mesh.current.geometry.setAttribute('position', pos);
			mesh.current.geometry.setIndex(predictorState.indices);

			mesh.current.material.uniforms.iChannel0.value.needsUpdate = true;
			mesh.current.material.uniforms.iChannel1.value.needsUpdate = true;

			mesh.current.geometry.attributes.position.needsUpdate = true;
			mesh.current.geometry.computeBoundingBox();
			mesh.current.geometry.computeBoundingSphere();



			predictorState.requireUpdate = false;
		}
	});
	const uniforms = {
		iChannel0: { type: 't', value: new THREE.CanvasTexture(canvasRef) },
		iChannel1: { type: 't', value: new THREE.CanvasTexture(imgRef) },
		iResolution: { type: 'v3', value: new THREE.Vector3(IMAGE_WIDTH, IMAGE_HEIGHT, 0) },
		iChannelResolution0: { type: 'v3', value: new THREE.Vector3(512.0 * 2, 512.0 * 2, 0.0) },
		iMouse: { type: 'v4', value: new THREE.Vector4() }
	};
	return (
		<mesh ref={mesh} >
			<bufferGeometry attach="geometry" args={[5000, 5000, 1, 1]} >
				<bufferAttribute attachObject={["attributes", "position"]} count={predictorState.vertices.length / 3} array={predictorState.vertices} itemSize={3} />
				<bufferAttribute attachObject={["attributes", "color"]} count={predictorState.colors.length / 3} array={predictorState.colors} itemSize={3} />
				<bufferAttribute attachObject={["attributes", "uv"]} count={predictorState.uvs.length / 2} array={predictorState.uvs} itemSize={2} />
			</bufferGeometry>
			<shaderMaterial attach="material" args={[{
				uniforms: uniforms,
				vertexShader: VERTEX_SHADER_3D_PHOTO,
				fragmentShader: FRAGMENT_SHADER_3D_PHOTO,
				wireframe: false,
				wireframeLinewidth: 2,
				glslVersion: THREE.GLSL3
			}]} />
		</mesh>
	)
}

function Background(props) {
	const mesh = useRef()
	const canvasRef = useRef(document.getElementsByName("canvas"));
	const imgRef = useRef(document.getElementById("uploaded"))
	
	const uniforms = {
		iChannel0: { type: 't', value: new THREE.CanvasTexture(canvasRef) },
		iChannel1: { type: 't', value: new THREE.CanvasTexture(imgRef) },
		iResolution: { type: 'v3', value: new THREE.Vector3(IMAGE_WIDTH, IMAGE_HEIGHT, 0) },
		iChannelResolution0: { type: 'v3', value: new THREE.Vector3(512.0 * 2, 512.0 * 2, 0.0) },
		iMouse: { type: 'v4', value: new THREE.Vector4() }
	};
	console.log(JSON.stringify(uniforms))
	return (
		<mesh ref={mesh} >
			<planeGeometry attach="geometry" args={[IMAGE_WIDTH * PLANE_SIZE, IMAGE_HEIGHT * PLANE_SIZE, 10, 10]} />
			<shaderMaterial attach="material" args={[{
				uniforms: uniforms,
				vertexShader: VERTEX_SHADER_3D_PHOTO,
				fragmentShader: FRAGMENT_SHADER_3D_PHOTO,
				wireframe: false,
				wireframeLinewidth: 2,
				glslVersion: THREE.GLSL3
			}]} />
		</mesh>
	)
}



export default Generate3D;