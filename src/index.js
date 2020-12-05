/*
 * @Author: greatpie
 * @Date: 2020-11-21 02:50:58
 * @LastEditTime: 2020-12-06 04:28:05
 * @LastEditors: greatpie
 * @FilePath: /OMO_GIS/src/index.js
 */
import * as THREE from 'three'
import { AxesHelper } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

function main() {
  const canvas = document.querySelector('#c')
  const renderer = new THREE.WebGLRenderer({ canvas })

  const fov = 45
  const aspect = 2 // the canvas default
  const near = 0.1
  const far = 100
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  camera.position.set(0, 10, 20)

  const controls = new OrbitControls(camera, canvas)
  controls.target.set(0, 5, 0)
  controls.update()

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('grey')

  // add grid helper
  const size = 10
  const divisions = 10

  const gridHelper = new THREE.GridHelper(size, divisions)
  scene.add(gridHelper)

  {
    const planeSize = 40

    const loader = new THREE.TextureLoader()
    const texture = loader.load('./assets/images/checker.png')
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.magFilter = THREE.NearestFilter
    const repeats = planeSize / 2
    texture.repeat.set(repeats, repeats)

    const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize)
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(planeGeo, planeMat)
    mesh.rotation.x = Math.PI * -0.5
    scene.add(mesh)
  }

  {
    const skyColor = 0xb1e1ff // light blue
    const groundColor = 0xb97a20 // brownish orange
    const intensity = 1
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity)
    scene.add(light)
  }

  {
    const color = 0xffffff
    const intensity = 1
    const light = new THREE.DirectionalLight(color, intensity)
    light.position.set(5, 10, 2)
    scene.add(light)
    scene.add(light.target)
  }

  function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5)
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY)
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = new THREE.Vector3()
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
      .normalize()

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter))

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100
    camera.far = boxSize * 100

    camera.updateProjectionMatrix()

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z)
  }

  {
    const gltfLoader = new GLTFLoader()
    gltfLoader.load(
      './assets/models/cartoon_lowpoly_small_city/scene.gltf',
      (gltf) => {
        const root = gltf.scene
        scene.add(root)

        // compute the box that contains all the stuff
        // from root and below
        const box = new THREE.Box3().setFromObject(root)

        const boxSize = box.getSize(new THREE.Vector3()).length()
        const boxCenter = box.getCenter(new THREE.Vector3())

        // set the camera to frame the box
        frameArea(boxSize * 0.5, boxSize, boxCenter, camera)

        // update the Trackball controls to handle the new size
        controls.maxDistance = boxSize * 10
        controls.target.copy(boxCenter)
        controls.update()
      }
    )
  }

  // create a plane geometrey with video texture
  {
    const video = document.createElement('video')
    video.src = './assets/videos/cctv_demo.mp4'
    video.autoplay = 'autoplay'

    const planeTexture = new THREE.VideoTexture(video)
    const PlaneGeometry = new THREE.PlaneGeometry(600, 200)
    const planeMaterial = new THREE.MeshPhongMaterial({
      map: planeTexture,
    })
    const planeMesh = new THREE.Mesh(PlaneGeometry, planeMaterial)
    scene.add(planeMesh)
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const needResize = canvas.width !== width || canvas.height !== height
    if (needResize) {
      renderer.setSize(width, height, false)
    }
    return needResize
  }

  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
    }

    renderer.render(scene, camera)

    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)
}

main()
