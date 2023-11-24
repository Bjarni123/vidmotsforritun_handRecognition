import {
    BoxBufferGeometry,
    Color,
    Mesh,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    DirectionalLight,
    MeshStandardMaterial,
    Clock,
    MathUtils,
    AmbientLight,
    HemisphereLight,
    SphereBufferGeometry,
    Group,
    SphereGeometry,
    BoxGeometry,
    Curve,
    TubeGeometry,
    Vector3
} from 'https://unpkg.com/three@0.132.2/build/three.module.js';
    
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js?module';

class HandleCustomSinCurve extends Curve {

    constructor( scale = 1 ) {
        super();
        this.scale = scale;
    }

    getPoint( t, optionalTarget = new Vector3() ) {

        const tx = t * 1 - 1.5;
        const ty = Math.sin( 1 * Math.PI * t );
        const tz = 0;

        return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );
    }
}

class StoutCustomSinCurve extends Curve {

    constructor( scale = 1 ) {
        super();
        this.scale = scale;
    }

    getPoint( t, optionalTarget = new Vector3() ) {

        const tx = t * 2 - 1.5;
        const ty = Math.cos( 1 * Math.PI * t );
        const tz = 0;

        return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );
    }
}

function createRenderer() {
    const renderer = new WebGLRenderer({ antialias: true });

    renderer.physicallyCorrectLights = true;

    renderer.shadowMap.enabled = true;

    return renderer;
}

function createScene() {
    const scene = new Scene();

    scene.background = new Color('red');

    return scene;
}

function createCamera() {
    const camera = new PerspectiveCamera(
        35, // fov = Field Of View
        1, // aspect ratio (dummy value)
        0.1, // near clipping plane
        100, // far clipping plane
    );

    // move the camera back so we can view the scene
    camera.position.set(0, 0, 10);

    return camera;
}


function createFloor() {
    const floorGeometry = new BoxBufferGeometry(10, 0.5, 10);
    const floorMaterial = new MeshStandardMaterial({ color: 'blue' });
    const floor = new Mesh(floorGeometry, floorMaterial);

    floor.receiveShadow = true
    floor.position.y = -3;

    return floor;
}

function createLights() {

    const ambientLight = new HemisphereLight(
        'white', // bright sky color
        'darkslategrey', // dim ground color
        2, // intensity
    );

    // const ambientLight = new AmbientLight('white', 2);
    // Create a directional light
    const mainLight = new DirectionalLight('white', 8);

    mainLight.castShadow = true

    // move the light right, up, and towards us
    mainLight.position.set(0, 10, 0);

    return {mainLight, ambientLight};
}


const group = new Group();
function createKettle() {

    const bottomBoxGeometry = new SphereGeometry(1.43, 32, 4);
    const bottomBoxMaterial = new MeshStandardMaterial({ color: 'purple' });
    const bottomBox = new Mesh(bottomBoxGeometry, bottomBoxMaterial);
    bottomBox.scale.y = 0.15;
    bottomBox.position.y = -1.43;
    bottomBox.castShadow = true;
    group.add(bottomBox);

    const bottomCurveGeometry = new SphereGeometry( 2, 32, 16, 0, 6.28, 2.03, 0.33 ); 
    const bottomCurveMaterial = new MeshStandardMaterial( { color: 0xffff00 } ); 
    const bottomCurve = new Mesh( bottomCurveGeometry, bottomCurveMaterial );
    // sphere.rotation.x = 180;
    bottomCurve.castShadow = true;
    group.add(bottomCurve);

    const sidesGeometry = new SphereGeometry( 1.8, 32, 16, 0, 6.28, 0.5, 1 ); 
    const sidesMaterial = new MeshStandardMaterial( ); 
    const sides = new Mesh( sidesGeometry, sidesMaterial );
    sides.position.y = -1.025;
    sides.castShadow = true;
    group.add(sides);

    const handlePath = new HandleCustomSinCurve( 1.5 );
    const handleGeometry = new TubeGeometry( handlePath, 20, 0.15, 8, false );
    const handleMaterial = new MeshStandardMaterial( { color: 0x00ff00 } );
    const handle = new Mesh( handleGeometry, handleMaterial );
    handle.rotation.set(0, 0, 1.3)
    handle.position.set(-0.6, 1, 0)
    handle.castShadow = true;
    group.add( handle );

    const stoutPath = new StoutCustomSinCurve( 1.5 );
    const stoutGeometry = new TubeGeometry( stoutPath, 20, 0.3, 8, false );
    const stoutMaterial = new MeshStandardMaterial( { color: 0x00ff00 } );
    const stout = new Mesh( stoutGeometry, stoutMaterial );
    stout.scale.set(0.5, 0.5, 0.5);
    stout.position.set(2, 0.1, 0);
    stout.rotation.set(0, 3, 0,);
    stout.castShadow = true;
    group.add( stout );

    group.tick = (delta) => {};

    return group;
}

function onResize() {
    console.log('You resized the browser window!');
}

window.addEventListener('resize', onResize);

const setSize = (container, camera, renderer) => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
};

class Resizer {
    constructor(container, camera, renderer) {
        // set initial size
        setSize(container, camera, renderer);

        window.addEventListener("resize", () => {
            // set the size again if a resize occurs
            setSize(container, camera, renderer);
            //this.onResize();
        });
    }

//onResize();
}

const clock = new Clock();

class Loop {
    constructor(camera, scene, renderer) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.updatables = [];
    }

    start() {
        this.renderer.setAnimationLoop(() => {
            // tell every animated object to tick forward one frame
            this.tick();

            // render a frame
            this.renderer.render(this.scene, this.camera);
        });
    }

    stop() {
        this.renderer.setAnimationLoop(null);
    }

    tick() {
        const delta = clock.getDelta();
        for (const object of this.updatables) {
            object.tick(delta);
        }
    }
}

function createControls(camera, canvas) {
    const controls = new OrbitControls(camera, canvas);

    controls.enableDamping = true;

    controls.tick = () => controls.update();

    // controls.listenToKeyEvents(window);

    controls.autoRotate = false;
    controls.autoRotateSpeed = 1;

    controls.minDistance = 0; // 8
    controls.maxDistance = 1000; // 20

    return controls;
}

let camera;
let renderer;
let scene;
let loop;

class World {
    constructor(container) {
        camera = createCamera();
        scene = createScene();
        renderer = createRenderer();
        loop = new Loop(camera, scene, renderer);
        container.append(renderer.domElement);

        const controls = createControls(camera, renderer.domElement);

        const kettle = createKettle();


        const floor = createFloor();
        const { ambientLight, mainLight } = createLights();

        //controls.target.copy(meshGroup.position);

        // loop.updatables.push(cube);
        loop.updatables.push(controls, kettle);

        //scene.add(ambientLight, mainLight, cube);
        scene.add(ambientLight, mainLight, kettle, floor);

        const resizer = new Resizer(container, camera, renderer);
        /* resizer.onResize = () => {
        this.render();
        }; */

        controls.addEventListener('change', () => {
            this.render();
        });
    }

    render() {
        renderer.render(scene, camera);
    }

    start() {
        loop.start();
    }

    stop() {
        loop.stop();
    }
}

function threejsMain() {
    // Get a reference to the container element
    const container = document.querySelector('#scene-container');

    // 1. Create an instance of the World app
    const world = new World(container);

    // 2. Render the scene
    world.start();
}

function rotateZ(rotateThing) {
    group.rotation.z += rotateThing * 0.1;
    // group.rotation.x += 0.01;
    // console.log('rotateX');
}

function rotateY(rotateThing) {
    group.rotation.y += rotateThing * 0.1;
}

function rotateX(rotateThing) {
    group.rotation.x += rotateThing * 0.1;
}


// main();
export { threejsMain, rotateX, rotateY, rotateZ };