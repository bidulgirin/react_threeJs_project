import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import bumplefishModel from "../assets/modeling/bumplefish/source/untitled.gltf";
import bumplefishTexture from "../assets/modeling/bumplefish/textures/gltf_embedded_0.png";
// three js 작성
const ThreeScene = () => {
    const mountRef = useRef(null);
    const cameraRef = useRef(null); // 카메라를 참조할 ref
    const rendererRef = useRef(null); // 렌더러를 참조할 ref

    useEffect(() => {
        // 📌 씬 생성
        const scene = new THREE.Scene();

        // 📌 카메라 설정 (원근 카메라)
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 5;
        cameraRef.current = camera; // 카메라 참조

        // 📌 렌더러 생성
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer; // 렌더러 참조

        // 📌 빛 설정
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const softLight = new THREE.AmbientLight(0x404040); // soft white light
        scene.add(softLight);
        softLight.position.set(0, 0, 0);

        // 물고기 모델링 생성해서 씬에 넣어보기
        // 📌 GLTFLoader 인스턴스 생성
        const loader = new GLTFLoader();
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(`${bumplefishTexture}`);

        // 📌 3D 모델 로드
        loader.load(
            `${bumplefishModel}`, // 경로: 모델 파일 (GLTF/GLB)
            function (gltf) {
                const model = gltf.scene;
                const animations = gltf.animations;

                model.position.set(0, 0, 0); // 위치 조정

                const xRotate = 0;
                const yRotate = 0;
                const zRotate = 0;

                model.rotation.set(xRotate, yRotate, zRotate); // Y축으로 180도 회전시켜서 앞을 보게 함

                scene.add(model); // 씬에 추가

                model.traverse((child) => {
                    if (child.isMesh) {
                        child.material.map = texture;
                        child.material.needsUpdate = true; // 재렌더링을 위해
                    }
                });

                if (animations && animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(model);

                    animations.forEach((clip) => {
                        mixer.clipAction(clip).play();
                    });

                    scene.add(model);

                    // 애니메이션을 업데이트하는 루프
                    function fishMoving() {
                        requestAnimationFrame(fishMoving);
                        mixer.update(0.01); // 애니메이션 업데이트
                        renderer.render(scene, camera);
                    }
                    fishMoving();
                } else {
                    console.log("애니메이션이 포함되지 않은 모델입니다.");
                }
            },
            //xhr.total 가 값이 0 이 나와서 (서버에서 안던져주는것같음) 주석처리함
            function (xhr) {
                console.log("xhr", xhr.total);
                console.log(`로드 진행 중: ${(xhr.loaded / xhr.total) * 100}%`);
            },
            // undefined,
            function (error) {
                console.error("로드 실패:", error);
            }
        );
        // 📌 OrbitControls 추가
        const controls = new OrbitControls(camera, renderer.domElement); // 카메라와 렌더러를 OrbitControls에 전달
        controls.enableDamping = true; // 댐핑 효과 (부드러운 움직임)
        controls.dampingFactor = 0.25; // 댐핑 정도
        controls.screenSpacePanning = false; // 화면 상의 이동 제한

        // 📌 애니메이션 루프
        const animate = () => {
            requestAnimationFrame(animate);

            controls.update(); // OrbitControls 업데이트
            renderer.render(scene, camera);
        };

        animate();

        // 📌 화면 리사이즈 시 카메라와 렌더러 크기 조정
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            // 카메라의 종횡비 업데이트
            camera.aspect = width / height;
            camera.updateProjectionMatrix(); // 카메라의 프로젝션 행렬 업데이트

            // 렌더러 크기 업데이트
            renderer.setSize(width, height);
        };

        window.addEventListener("resize", handleResize);

        // 📌 클린업 (컴포넌트가 언마운트될 때 정리)
        return () => {
            window.removeEventListener("resize", handleResize);
            //mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} />;
};

const Bumplefish = () => {
    return <ThreeScene />;
};

export default Bumplefish;
