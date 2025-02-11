import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import bumplefishModel from "../assets/modeling/bumplefish/source/untitled.gltf";
import bumplefishTexture from "../assets/modeling/bumplefish/textures/gltf_embedded_0.png";
// three js 작성
const ThreeScene = () => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const mixerRef = useRef(null); // 애니메이션 믹서 참조
    const modelRef = useRef(null); // 모델 참조
    const sceneRef = useRef(null); // 씬 참조
    const mountRef = useRef(null);
    const cameraRef = useRef(null); // 카메라를 참조할 ref
    const rendererRef = useRef(null); // 렌더러를 참조할 ref

    // 물고기 모델 위치/각도 세팅
    let x = 0;
    let y = 0;
    let z = 0;
    let xRotate = 0.5;
    let yRotate = 1.5;
    let zRotate = 0;

    // 📌 씬 생성
    const scene = new THREE.Scene();

    // 📌 GLTFLoader 인스턴스 생성
    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(`${bumplefishTexture}`);

    // 📌 카메라 설정 (원근 카메라)
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    // 📌 렌더러 생성
    const renderer = new THREE.WebGLRenderer();
    const renderDom = renderer.domElement;

    // 📌 OrbitControls 추가
    //const controls = new OrbitControls(camera, renderDom); // 카메라와 렌더러를 OrbitControls에 전달
    // controls.enableDamping = true; // 댐핑 효과 (부드러운 움직임)
    // controls.dampingFactor = 0.25; // 댐핑 정도
    // controls.screenSpacePanning = false; // 화면 상의 이동 제한
    // controls.enableZoom = false; // 줌 비활성화

    // 📌 빛 설정
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    const softLight = new THREE.AmbientLight(0x404040); // soft white light
    softLight.position.set(0, 0, 0);
    scene.add(light, softLight);

    const setThreeJs = () => {
        if (!mountRef.current) return;
        if (sceneRef.current) return; // ✅ 이미 초기화된 경우 중복 생성 방지

        sceneRef.current = scene; // 씬 참조
        cameraRef.current = camera; // 카메라 참조
        rendererRef.current = renderer; // 렌더러 참조

        mountRef.current.appendChild(renderDom);
        renderer.setSize(window.innerWidth, window.innerHeight);

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
            renderer.dispose();
        };
    };

    const loadModel = () => {
        // 📌 3D 모델 로드
        loader.load(
            bumplefishModel, // 모델 파일 (GLTF/GLB)
            function (gltf) {
                const model = gltf.scene;
                const animations = gltf.animations;

                modelRef.current = model; // 모델 참조
                model.position.set(x ?? 0, y ?? 0, z ?? 0); // 위치 조정
                model.rotation.set(xRotate ?? 0, yRotate ?? 0, zRotate ?? 0); // 회전 설정

                // 텍스처 적용
                model.traverse((child) => {
                    if (child.isMesh) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach((mat) => {
                                mat.map = texture;
                                mat.needsUpdate = true;
                            });
                        } else {
                            child.material.map = texture;
                            child.material.needsUpdate = true;
                        }
                    }
                });

                // 애니메이션 믹서 생성
                mixerRef.current = new THREE.AnimationMixer(model);
                animations.forEach((clip) =>
                    mixerRef.current.clipAction(clip).play()
                );

                // 애니메이션 루프
                const animate = () => {
                    requestAnimationFrame(animate);
                    if (mixerRef.current) {
                        mixerRef.current.update(0.01); // 애니메이션 업데이트
                    }
                    renderer.render(scene, camera);
                };
                animate();

                scene.add(model); // 씬에 모델 추가
            },
            undefined, // 로드 진행 콜백 생략
            (error) => console.error("로드 실패:", error) // 에러 핸들링
        );
    };
    useEffect(() => {
        setThreeJs();
        loadModel();
    }, []);

    useEffect(() => {
        const handleWheel = (event) => {
            if (!modelRef.current) return;

            // wheel 이벤트에서 deltaY 값을 가져와서 모델의 위치와 회전 변화
            const delta = event.deltaY > 0 ? 1 : -1; // 휠 방향에 따라 양/음 값 결정

            // 모델의 위치 변화 (deltaY에 비례하여 이동)
            const maxMovement = 5; // 모델의 최대 이동 범위
            const movementFactor = 0.05; // 휠에 따른 이동 비율
            const movement = delta * movementFactor * maxMovement;

            modelRef.current.position.x += movement; // X축 이동
            modelRef.current.position.y += movement; // Y축 이동
            modelRef.current.position.z += movement; // Z축 이동

            // 모델의 회전 변화 (deltaY에 비례하여 회전)
            const maxRotation = Math.PI * 2; // 회전 최대 값 (360도)
            const rotationFactor = 0.01; // 휠에 따른 회전 비율
            modelRef.current.rotation.x += delta * rotationFactor;
            modelRef.current.rotation.y += delta * rotationFactor;
            modelRef.current.rotation.z += delta * rotationFactor;

            // 카메라도 모델을 계속 바라보게 설정 (필요시)
            camera.lookAt(modelRef.current.position);
        };

        // wheel 이벤트 리스너 추가
        window.addEventListener("wheel", handleWheel);

        // cleanup 함수에서 이벤트 리스너 제거
        return () => {
            window.removeEventListener("wheel", handleWheel);
        };
    }, []);

    useEffect(() => {
        let startX = 0;
        let startY = 0;
        let startTouch = false;

        const handleTouchStart = (event) => {
            // 터치 시작 위치 저장 (첫 번째 터치만 사용)
            startTouch = true;
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
        };

        const handleTouchMove = (event) => {
            if (!startTouch || !modelRef.current) return;

            // 터치 이동 거리 계산
            const moveX = event.touches[0].clientX - startX;
            const moveY = event.touches[0].clientY - startY;

            // 모델의 위치와 회전 변화
            const movementFactor = 0.1; // 터치 이동 비율 조정
            const rotationFactor = 0.005; // 터치 이동에 따른 회전 비율 조정

            // 모델의 위치 변화 (X, Y, Z 축 이동)
            modelRef.current.position.x += moveX * movementFactor;
            modelRef.current.position.y -= moveY * movementFactor; // Y축은 반대 방향
            modelRef.current.position.z += (moveX + moveY) * movementFactor;

            // 모델의 회전 변화 (터치 이동에 따른 회전)
            modelRef.current.rotation.x += moveY * rotationFactor;
            modelRef.current.rotation.y += moveX * rotationFactor;

            // 터치 위치 업데이트
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;

            // 카메라도 모델을 계속 바라보게 설정 (필요시)
            camera.lookAt(modelRef.current.position);
        };

        const handleTouchEnd = () => {
            startTouch = false;
        };

        // 터치 이벤트 리스너 추가
        window.addEventListener("touchstart", handleTouchStart);
        window.addEventListener("touchmove", handleTouchMove);
        window.addEventListener("touchend", handleTouchEnd);

        // cleanup 함수에서 이벤트 리스너 제거
        return () => {
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, []);

    return <div ref={mountRef} />;
};

const Bumplefish = () => {
    return <ThreeScene />;
};

export default Bumplefish;
