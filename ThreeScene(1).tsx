
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ABCNode, ABCEdge } from '../types';

interface ThreeSceneProps {
  nodes: ABCNode[];
  edges: ABCEdge[];
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ nodes, edges }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodesGroupRef = useRef<THREE.Group>(new THREE.Group());
  const edgesGroupRef = useRef<THREE.Group>(new THREE.Group());

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020205);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(20, 20, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 20, 15);
    scene.add(pointLight);

    scene.add(nodesGroupRef.current);
    scene.add(edgesGroupRef.current);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Update Nodes
    nodesGroupRef.current.clear();
    const sphereGeom = new THREE.SphereGeometry(0.35, 12, 12);
    
    const colors = {
      'a': 0xff4444, 'b': 0x4444ff, 'c': 0x44ff44,
      'A': 0xff0000, 'B': 0x0000ff, 'C': 0x00ff00
    };

    nodes.forEach(node => {
      const color = colors[node.state] || 0x888888;
      const mat = new THREE.MeshPhongMaterial({ 
        color, 
        emissive: node.isExcited ? color : 0x000000,
        emissiveIntensity: node.isExcited ? 1.5 : 0 
      });
      const mesh = new THREE.Mesh(sphereGeom, mat);
      mesh.position.set(node.x, node.y, node.z);
      if (node.isExcited) mesh.scale.set(1.6, 1.6, 1.6);
      nodesGroupRef.current.add(mesh);
    });

    // Update Edges
    edgesGroupRef.current.clear();
    const lineMat = new THREE.LineBasicMaterial({ color: 0x333344, transparent: true, opacity: 0.4 });
    
    edges.forEach(edge => {
      if (edge.id % 2 !== 0) return; // Optimization: draw fewer lines for performance
      const n1 = nodes.find(n => n.id === edge.node1);
      const n2 = nodes.find(n => n.id === edge.node2);
      if (!n1 || !n2) return;

      const points = [
        new THREE.Vector3(n1.x, n1.y, n1.z),
        new THREE.Vector3(n2.x, n2.y, n2.z)
      ];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geom, lineMat);
      edgesGroupRef.current.add(line);
    });
  }, [nodes, edges]);

  return <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden shadow-2xl" />;
};

export default ThreeScene;
