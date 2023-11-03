import * as THREE from 'three'
import { three } from './core/Three'
import fragmentShader from './shader/points.fs'
import vertexShader from './shader/points.vs'
import { gui } from './Gui'

export class Canvas {
  private points!: THREE.Points<THREE.BufferGeometry, THREE.RawShaderMaterial>
  private mouseTarget = [0, 0]

  constructor(canvas: HTMLCanvasElement) {
    this.loadTextures().then((textures) => {
      this.init(canvas)
      this.points = this.createPoints(textures)
      this.addEvents()
      three.animation(this.anime)
    })
  }

  private async loadTextures() {
    const loader = new THREE.TextureLoader()
    loader.setPath(import.meta.env.BASE_URL + 'textures/')

    const fileNames = ['01', 'text']
    return Promise.all(
      fileNames.map(async (name) => {
        const texture = await loader.loadAsync(`${name}.jpg`)
        texture.name = name
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.userData.aspect = texture.source.data.width / texture.source.data.height
        return texture
      }),
    )
  }

  private init(canvas: HTMLCanvasElement) {
    three.setup(canvas)
    three.scene.background = new THREE.Color('#000')
  }

  private createPoints(textures: THREE.Texture[]) {
    const geometry = new THREE.BufferGeometry()

    const positions: number[] = []

    const pos = 0.02
    const amount = 100
    const offset = (amount - 1) * pos * 0.5

    for (let x = 0; x < amount; x++) {
      for (let y = 0; y < amount; y++) {
        positions.push(x * pos - offset, y * pos - offset, 0)
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

    const find = (name: string) => textures.find((t) => t.name === name)!
    const t01 = find('01')
    const tText = find('text')

    const material = new THREE.RawShaderMaterial({
      uniforms: {
        uPointSize: { value: this.calcPointSize() },
        t01: { value: t01 },
        tText: { value: tText },
        uCoveredScale: { value: three.coveredScale(tText.userData.aspect) },
        uMouse: { value: [0, 0] },
        uTime: { value: 0 },
      },
      vertexShader,
      fragmentShader,
    })
    const mesh = new THREE.Points(geometry, material)
    three.scene.add(mesh)

    return mesh
  }

  private calcPointSize() {
    return 25 * (three.size.height / 1000)
  }

  private addEvents() {
    three.addEventListener('resize', () => {
      const uniforms = this.points.material.uniforms
      uniforms.uPointSize.value = this.calcPointSize()
      uniforms.uCoveredScale.value = three.coveredScale(uniforms.tText.value.userData.aspect)
    })

    let isHold = false
    let prev = [0, 0]

    three.addEventListener('mousedown', (e) => {
      isHold = true
      prev = [e.clientX, e.clientY]
    })
    three.addEventListener('mouseup', () => {
      isHold = false
    })
    three.addEventListener('mouseout', () => {
      isHold = false
    })
    three.addEventListener('mousemove', (e) => {
      if (isHold) {
        this.mouseTarget[0] -= (e.clientX - prev[0]) * 0.0015
        this.mouseTarget[1] += (e.clientY - prev[1]) * 0.0015
        prev = [e.clientX, e.clientY]
      }
    })
  }

  private anime = () => {
    const uniforms = this.points.material.uniforms
    uniforms.uTime.value += three.time.delta
    uniforms.uMouse.value[0] = THREE.MathUtils.lerp(uniforms.uMouse.value[0], this.mouseTarget[0], 0.1)
    uniforms.uMouse.value[1] = THREE.MathUtils.lerp(uniforms.uMouse.value[1], this.mouseTarget[1], 0.1)

    three.render()
  }

  dispose() {
    three.dispose()
  }
}
