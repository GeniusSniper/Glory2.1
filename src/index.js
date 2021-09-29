// import './index.css';
import * as dat from 'dat.gui';
import * as THREE from 'three';
// import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
// import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import Stats from 'stats.js'

let keyborad = [];
let time = Date.now();
let timer = 0;

addEventListener('keydown', e => {
    console.log(e.key);
    keyborad[e.key] = true;
});

addEventListener('keyup', e => {
    keyborad[e.key] = false;
});

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );
document.addEventListener('DOMContentLoaded', () => {
    /**
     * Base
     */
    //FPS

    // Debug
    const gui = new dat.GUI({
        width: 400
    });

    // Canvas
    const canvas = document.querySelector('canvas.webgl');

    // Scene
    const scene = new THREE.Scene();

    //Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff);
    const directLight = new THREE.DirectionalLight(0xffffff);

    scene.add(ambientLight, directLight);

    /**
     * Loaders
     */
    // Texture loader
    const textureLoader = new THREE.TextureLoader();

    // Draco loader
    // const dracoLoader = new DRACOLoader();
    // dracoLoader.setDecoderPath('draco/');

    // GLTF loader
    const gltfLoader = new GLTFLoader();
    // gltfLoader.setDRACOLoader(dracoLoader);

    /**
     * Object
     */
    // const cube = new THREE.Mesh(
    //     new THREE.BoxGeometry(1, 1, 1),
    //     new THREE.MeshBasicMaterial()
    // );

    // scene.add(cube);

    gltfLoader.load('range.glb', gltf => {
        scene.add(gltf.scene);
    })

    /**
     * Sizes
     */
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    window.addEventListener('resize', () =>
    {
        // Update sizes
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;

        // Update camera
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();

        // Update renderer
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    /**
     * Camera
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
    camera.position.x = 4;
    camera.position.y = 2;
    camera.position.z = 4;
    scene.add(camera);

    // Controls
    // const controls = new OrbitControls(camera, canvas);
    // controls.enableDamping = true;
    // let controls = new FirstPersonControls(camera, canvas);
    // const control = new PointerLockControls(camera, canvas);

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    //PlayerControlsMovement
    let _vector = new THREE.Vector3();
    let euler = new THREE.Euler(0, 0, 0, 'YXZ');
    // let parentEuler = new THREE.Euler();
    // let euler = new THREE.Euler(parentEuler);
    let lock = true;
    let keyboradControl = (time) => {
        if(keyborad['w']){
            moveforward(time * .01);
        }
        if(keyborad['s']){
            moveforward(-time * .01);
        }
        if(keyborad['d']){
            moveSide(time * .01);
        }
        if(keyborad['a']){
            moveSide(-time * .01);
        }
        if(keyborad['0']){
            if(timer < 0){
                console.log(camera);
                console.log(camera.rotation);
                // console.log(controls);
                timer = 5;
            } else {
                timer--;
            }
        }
        if(keyborad['q']){
            lock = true;
            canvas.ownerDocument.exitPointerLock();
        }
        if(keyborad['y']){
            lock = false;
            canvas.requestPointerLock();
        }
    }

    let clamp = (n, min, max) => {
        if(n > max){
            return max;
        } else if(n < min){
          return min
        } else{
            return n;
        }
      }

    let mousemove = e => {
        if(lock) return ; 
        const movementX = e.movementX || 0;//left is -1, right is +1
        const movementY = e.movementY || 0;//up is -1, down is +1

        //mousemove controls
        euler.x -= movementY * .002;
        euler.y -= movementX * .002;

        euler.x = clamp(euler.x, -Math.PI/2, Math.PI/2);
        // euler.y = clamp(euler.y, -Math.PI, Math.PI);

        //pointer lock controls
        // euler.setFromQuaternion( camera.quaternion );

        // euler.y -= movementX * 0.002;
        // euler.x -= movementY * 0.002;

        // euler.x = Math.max( -Math.PI / 2, Math.min( Math.PI/2, euler.x ) );

        camera.quaternion.setFromEuler( euler );

        //camera rotations
        // let xrotation = camera.rotation.x - movementY * .002,
        //     yrotation = camera.rotation.y - movementX * .002;
        
        // xrotation = clamp(xrotation, -Math.PI/2, Math.PI/2);
        // yrotation = clamp(yrotation, -Math.PI, Math.PI);

        // euler.x = xrotation;
        // euler.y = yrotation;
        
        // euler.x = xrotation;
        // parentEuler.y = yrotation;
        
        // camera.quaternion.setFromEuler(euler);


        // camera.rotation.x = xrotation;
        // camera.rotation.y = yrotation;

        
        //debugging
        // if(timer < 0){
        //     console.log(movementX, movementY);
        //     console.log(euler, parentEuler);
        //     timer = 5;
        // } else {
        //     timer--;
        // }
    }

    addEventListener('mousemove', mousemove);


    let moveforward = distance => {
        _vector.setFromMatrixColumn( camera.matrix, 0 );

        _vector.crossVectors( camera.up, _vector );

        camera.position.addScaledVector( _vector, distance );
    }
    let moveSide = distance => {

        _vector.setFromMatrixColumn( camera.matrix, 0 );

        camera.position.addScaledVector( _vector, distance );

    };
    /**
     * Animate
     */
    const clock = new THREE.Clock();

    const tick = () => {
        stats.begin();

        const elapsedTime = clock.getElapsedTime();
        const currentTime = Date.now();
        const deltaTime = currentTime - time;
        time = currentTime;

        // Update controls
        keyboradControl(deltaTime);
        // controls.update(deltaTime * .01);

        // Render
        renderer.render(scene, camera);

        // Call tick again on the next frame
        window.requestAnimationFrame(tick);
        stats.end();
    }

    tick();
});
