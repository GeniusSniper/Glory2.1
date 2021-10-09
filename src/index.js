// import './index.css';
import * as dat from 'dat.gui';
import CANNON from 'cannon';//physics engine
import * as THREE from 'three';
// import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
// import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import Stats from 'stats.js';

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

    const debugObject = {}

    debugObject.createSphere = () => {
        createSphere(
            Math.random() * .5, {
                x: (Math.random() - .5) * .3,
                y: 3, 
                z: (Math.random() - .5) * 3
            })
    };
    gui.add(debugObject, 'createSphere');

    let obj = {};

    /**
     * Sizes
     */
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    // Canvas
    const canvas = document.querySelector('canvas.webgl');

    // Scene
    const scene = new THREE.Scene();

    //World
    const world = new CANNON.World();
    world.broadphase = new CANNON.SAPBroadphase(world); // creating ground
    world.allowSleep = true;
    world.gravity.set(0, - 9.82, 0);
    // world.gravity.set(0, - 1, 0);

    // Materials
    const defaultMaterial = new CANNON.Material('default');// default material for cannon

    const defaultContactMaterial = new CANNON.ContactMaterial(
        defaultMaterial,
        defaultMaterial,{
            friction: .1,
            restitution: .7
        }
    );
    world.addContactMaterial(defaultContactMaterial);
    world.defaultContactMaterial = defaultContactMaterial;

    

    /**
     * Camera
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
    camera.position.x = 0;
    camera.position.y = 2;
    camera.position.z = 9;
    scene.add(camera);

    // Controls
    // const controls = new OrbitControls(camera, canvas);
    // controls.enableDamping = true;
    // let controls = new FirstPersonControls(camera, canvas);
    // const control = new PointerLockControls(camera, canvas);


    //Floor
    // const floorShape = new CANNON.Plane();
    // const floorBody = new CANNON.Body();
    // floorBody.mass = 0;
    // floorBody.addShape(floorShape);
    // floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2);
    // world.addBody(floorBody);

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

    //Archer
    let archer = new CANNON.Body({
        mass: 0
    });
    gltfLoader.load('range.glb', gltf => {
        // console.log(gltf);
        gltf.scene.traverse( child => {
            // console.log(child);
            if(child.isMesh){
                // let verts = [], faces = [];

                // // Get vertices
                // let arcPos = child.geometry.attributes.position.array,
                //     arcIdx = child.geometry.index.array,
                //     arcSize = child.geometry.attributes.position.itemSize;
                // for(let i = 0; i < arcPos.length; i+=3){
                //     verts.push(
                //         new CANNON.Vec3( arcPos[(arcIdx[i] * arcSize)], arcPos[(arcIdx[i] * arcSize) + 1], arcPos[(arcIdx[i] * arcSize) + 2])
                //     );
                //     // faces.push(arcPos[(arcIdx[i] * arcSize)], arcPos[(arcIdx[i] * arcSize) + 1], arcPos[(arcIdx[i] * arcSize) + 2]);
                // }

                // // console.log(verts, faces);
                // console.log(child.geometry);
                // // Construct polyhedron
                // let part = new CANNON.ConvexPolyhedron(verts, faces);

                // archer.addShape(part);

                let verts = [], faces = [], scale = child.scale;
                let geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);

                //create vertices
                for (let i = 0; i < geometry.vertices.length; i++) {

                    let x = scale.x * geometry.vertices[i].x;
                    let y = scale.y * geometry.vertices[i].y;
                    let z = scale.z * geometry.vertices[i].z;
            
                    verts.push(new CANNON.Vec3(x, y, z));
                }
            
                //create faces
                for (let i = 0; i < geometry.faces.length; i++) {
            
                    let a = geometry.faces[i].a;
                    let b = geometry.faces[i].b;
                    let c = geometry.faces[i].c;
            
                    faces.push([a, b, c]);
                }

                //setup the phycics
                let part = new CANNON.ConvexPolyhedron(verts, faces);
                archer.addShape(part);
            }
        })
        scene.add(gltf.scene);
    });

    gltfLoader.load('target.gltf', gltf => {
        gltf.scene.traverse( child => {
            if(child.isMesh){
            let verts = [], faces = [], scale = child.scale;
                let geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);

                //create vertices
                for (let i = 0; i < geometry.vertices.length; i++) {

                    let x = scale.x * geometry.vertices[i].x;
                    let y = scale.y * geometry.vertices[i].y;
                    let z = scale.z * geometry.vertices[i].z;

                    verts.push(new CANNON.Vec3(x, y, z));
                }

                //create faces
                for (let i = 0; i < geometry.faces.length; i++) {

                    let a = geometry.faces[i].a;
                    let b = geometry.faces[i].b;
                    let c = geometry.faces[i].c;

                    faces.push([a, b, c]);
                }

                //setup the phycics
                let part = new CANNON.ConvexPolyhedron(verts, faces);
                archer.addShape(part);
            }
        })
        scene.add(gltf.scene);
    })  

    //Create Archer body
    // archer.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), - Math.PI/2 );
    // let z180 = new CANNON.Quaternion();
    // z180.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI );
    // archer.quaternion = z180.mult(archer.quaternion);

    world.addBody(archer);

    // let updatePistol = () => {
    //     if(obj.pistol){
    //         obj.pistol.position.set(
    //             camera.position.x - Math.sin(camera.rotation.y + Math.PI/6) * 0.75,
    //             camera.position.y - 0.5 + Math.sin(time*4 + camera.position.x + camera.position.z)*0.01,
    //             camera.position.z + Math.cos(camera.rotation.y + Math.PI/6) * 0.75
    //         )
    //     }
    // }

    //pistol
    // gltfLoader.load('pistol.gltf', gltf => {
    //     obj.pistol = gltf.scene;
    //     updatePistol();
    //     scene.add(obj.pistol);
    // });

    //testSphere
    const objectsToUpdate = [];

    const sphereGeometry  = new THREE.SphereBufferGeometry(1, 20, 20);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        metalness: .3,
        roughness: .4,
    });

    //sphere
    const createSphere = (radius, position) => {
        const mesh = new THREE.Mesh(
            sphereGeometry,
            sphereMaterial
        )
        mesh.scale.set(radius, radius, radius)
        mesh.castShadow = true;
        mesh.position.copy(position);
        scene.add(mesh);

        //Cannon.js body
        const shape = new CANNON.Sphere(radius);
        const body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(0, 3, 0),
            shape,
            material: defaultMaterial
        });
        body.position.copy(position);
        world.addBody(body);

        // save  in objects to update
        objectsToUpdate.push({
            mesh,
            body
        })
    }

    //shooting
    let sphereBody = new CANNON.Body({ mass: 5 });
    let sphereShape = new CANNON.Sphere(1.3);
    sphereBody.addShape(sphereShape);
    sphereBody.position.set(
        camera.position.x,
        camera.position.y,
        camera.position.z
        );
    sphereBody.linearDamping = 0.9;
    world.addBody(sphereBody);
    let ballShape = new CANNON.Sphere(0.2);
    let ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
    let shootDirection = new THREE.Vector3();
    let shootVelo = 15;
    // let projector = new THREE.Projector();
    let material = new THREE.MeshLambertMaterial( { color: 0xdddddd } );
    const getShootDir = (targetVec) => {
        let vector = targetVec;
        targetVec.set(0,0,1);
        // projector.unprojectVector(vector, camera);
        let ray = new THREE.Ray(sphereBody.position, vector.sub(sphereBody.position).normalize() );
        targetVec.copy(ray.direction);
    }

    const shot = () => {
        // if(controls.enabled==true){
            let x = sphereBody.position.x;
            let y = sphereBody.position.y;
            let z = sphereBody.position.z;
            let ballBody = new CANNON.Body({ mass: 1 });
            ballBody.addShape(ballShape);
            let ballMesh = new THREE.Mesh( ballGeometry, material );
            world.addBody(ballBody);
            console.log(ballBody);
            scene.add(ballMesh);
            // ballMesh.castShadow = true;
            // ballMesh.receiveShadow = true;
            objectsToUpdate.push({
                ballMesh, 
                ballBody
            });
            getShootDir(shootDirection);
            ballBody.velocity.set(  shootDirection.x * shootVelo,
                                    shootDirection.y * shootVelo,
                                    shootDirection.z * shootVelo);

            // Move the ball outside the player sphere
            // x += shootDirection.x * (sphereShape.radius*1.02 + ballShape.radius);
            // y += shootDirection.y * (sphereShape.radius*1.02 + ballShape.radius);
            // z += shootDirection.z * (sphereShape.radius*1.02 + ballShape.radius);
            ballBody.position.set(x,y,z);
            ballMesh.position.set(x,y,z);
        // }
    }

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
            // updatePistol();
        }
        if(keyborad['s']){
            moveforward(-time * .01);
            // updatePistol();
        }
        if(keyborad['d']){
            moveSide(time * .01);
            // updatePistol();
        }
        if(keyborad['a']){
            moveSide(-time * .01);
            // updatePistol();
        }
        if(keyborad['9']){
            debugObject.createSphere();
        }
        if(keyborad['0']){
            if(timer < 0){
                console.log(camera);
                console.log(camera.rotation);
                console.log(archer.position);
                // console.log(obj.pistol);
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
        if(keyborad['Escape']){
            lock = true;
        }
        if(keyborad['y']){
            lock = false;
            canvas.requestPointerLock();
        }
        if(keyborad[' ']){
            shot();
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

    // let updatePistolRotation = () => {
    //     obj.pistol.rotation.set(
    //         camera.rotation.x,
    //         camera.rotation.y - Math.PI,
    //         0
    //     )
    // }

    //player movement control
    let mousemove = e => {
        if(lock) return; 
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
        // updatePistolRotation();

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
    // let oldElapsedTime = 0;

    const tick = () => {
        stats.begin();

        const elapsedTime = clock.getElapsedTime();
        // const deltaTime = elapsedTime - oldElapsedTime;
        // oldElapsedtime = elapsedTime;
        const currentTime = Date.now();
        const deltaTime = currentTime - time;
        time = currentTime;

        //update phycics world
        world.step(1/60, deltaTime, 3);

        for(const object of objectsToUpdate){
            object.mesh.position.copy(object.body.position);
            object.mesh.quaternion.copy(object.body.quaternion);
        }

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
