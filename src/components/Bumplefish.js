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
            console.log("event", event);
            if (!modelRef.current) return;

            // wheel 이벤트에서 deltaY 값을 가져와서 모델의 위치와 회전 변화
            const delta = event.deltaY > 0 ? 1 : -1; // 휠 방향에 따라 양/음 값 결정
            // 모델의 위치 변화 (deltaY에 비례하여 이동)
            const maxMovement = 1; // 모델의 최대 이동 범위
            const movementFactor = 0.1; // 휠에 따른 이동 비율
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

            // 카메라도 모델을 계속 바라보게 설정
            camera.lookAt(modelRef.current.position);
        };

        // wheel 이벤트 리스너 추가
        //window.addEventListener("wheel", handleWheel);
        window.addEventListener("wheel", handleWheel);

        // cleanup 함수에서 이벤트 리스너 제거
        return () => {
            //window.removeEventListener("wheel", handleWheel);
            window.addEventListener("wheel", handleWheel);
        };
    }, []);

    useEffect(() => {
        const movementSpeed = 0.01; // 모델 이동 속도 (기본값)
        const rotationSpeed = 0.005; // 모델 회전 속도 (기본값)

        // 스크롤 이벤트 처리
        const handleScroll = () => {
            if (!modelRef.current) return;

            const scrollY = window.scrollY; // 현재 스크롤 위치
            const totalHeight = document.body.scrollHeight - window.innerHeight; // 전체 페이지 높이

            // 스크롤 위치에 비례하여 모델의 위치와 회전값 변경
            const scrollPercentage = scrollY / totalHeight;

            // 모델의 위치 변화 (X, Y, Z 축 이동)
            modelRef.current.position.x = scrollPercentage * 10; // X축 이동
            modelRef.current.position.y = scrollPercentage * 5; // Y축 이동
            modelRef.current.position.z = scrollPercentage * -10; // Z축 이동 (음수로 하면 카메라와 반대 방향으로 이동)

            // 모델의 회전 변화 (스크롤에 따른 회전)
            modelRef.current.rotation.x = scrollPercentage * Math.PI; // 180도 회전
            modelRef.current.rotation.y = scrollPercentage * Math.PI; // 180도 회전

            // 카메라가 모델을 계속 바라보게 설정
            camera.lookAt(modelRef.current.position);
        };

        // 터치 이벤트 처리
        let startX = 0;
        let startY = 0;
        let startTouch = false;

        const handleTouchStart = (event) => {
            startTouch = true;
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
        };

        const handleTouchMove = (event) => {
            if (!startTouch || !modelRef.current) return;

            const moveX = event.touches[0].clientX - startX;
            const moveY = event.touches[0].clientY - startY;

            // 일정한 속도로 모델 이동 및 회전
            modelRef.current.position.x += moveX * movementSpeed;
            modelRef.current.position.y -= moveY * movementSpeed; // Y축은 반대 방향
            modelRef.current.position.z += (moveX + moveY) * movementSpeed;

            modelRef.current.rotation.x += moveY * rotationSpeed;
            modelRef.current.rotation.y += moveX * rotationSpeed;

            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;

            camera.lookAt(modelRef.current.position);
        };

        const handleTouchEnd = () => {
            startTouch = false;
        };

        // 스크롤 이벤트 리스너 추가
        window.addEventListener("scroll", handleScroll);

        // 터치 이벤트 리스너 추가 (모바일에서도 작동)
        window.addEventListener("touchstart", handleTouchStart);
        window.addEventListener("touchmove", handleTouchMove);
        window.addEventListener("touchend", handleTouchEnd);

        // cleanup 함수에서 이벤트 리스너 제거
        return () => {
            window.removeEventListener("scroll", handleScroll);
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
