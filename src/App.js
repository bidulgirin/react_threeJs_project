import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const ThreeScene = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        // 1️⃣ 씬 생성
        const scene = new THREE.Scene();

        /*
          75도의 시야각을 가진 카메라
          현재 브라우저 창 크기에 맞는 종횡비
          0.1m보다 가까운 객체는 보이지 않고
          1000m보다 먼 객체도 보이지 않는
          📷 일반적인 3D 카메라 설정임 🚀
        */

        // 2️⃣ 카메라 설정 (원근 카메라)
        const camera = new THREE.PerspectiveCamera(
            75, // 시야각 (Field of View, FOV)
            window.innerWidth / window.innerHeight, // 종횡비 (Aspect Ratio)
            0.1, // 근평면 (Near Plane)
            1000 // 원평면 (Far Plane)
        );
        camera.position.z = 5;

        // 3️⃣ 렌더러 생성
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // 4️⃣ 박스(큐브) 생성
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // 5️⃣ 애니메이션 루프
        const animate = () => {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
        };

        animate();

        // 6️⃣ 화면 리사이즈 시 카메라와 렌더러 크기 조정
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

        // 7️⃣ 클린업 (컴포넌트가 언마운트될 때 정리)
        return () => {
            window.removeEventListener("resize", handleResize);
            mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} />;
};

function App() {
    return <ThreeScene />;
}

export default App;
