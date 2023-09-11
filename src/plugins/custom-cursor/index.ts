import type { Sayu } from '@/sayu'
import { Pointer } from './pointer'
import { h } from '@fairy/dom-fairy'
import './index.scss'

/**
 * Screen Point Coordinate to Center Point Coordinate
 */
const s2c = (position: Vector2D, centralPoint: Vector2D) => {
  return {
    x: position.x - centralPoint.x,
    y: position.y - centralPoint.y,
  } as CentralVector2D
}

export const install = (sayu: Sayu) => {
  let $pointer: HTMLElement = h('div', { 'class': 'sayu-pointer' })

  function sectorIndexFromPoint(position: Vector2D, hasMaxBorder = true) {
    position = s2c(position, pointer.centralPoint)

    const border = {
      min: sayu.options.r / 2 - sayu.options.triggerOffset,
      max: !hasMaxBorder ? sayu.options.R / 2 : Infinity,
    }

    const radius = Math.sqrt(position.x * position.x + position.y * position.y)
    if (radius < border.min || radius > border.max) {
      return -1
    }

    const sectorDegree = sayu.computed.sectorDegree
    const rawDegree = Math.atan2(position.y, position.x) * 180 / Math.PI
    const offsetDegree = sayu.options.sectorDegreeOffset(sayu.options, sayu.computed)

    /**
     * Adjust the <rawDegree> range from [-180, 180] to [0, 360],
     * and then set the 0-degree position of the degree to the left edge of the first sector menu-item.
     *
     * This way, calculations become convenient:
     * For example, if there are a total of 6 sector menu-items, each occupying 60 degrees, when the degree is 150 degrees
     * the sector's index we want which is 2
     * `const sectorIndex = Math.floor(150 / 60)`
     * so the corresponding point for that degree falls on the 2nd menu-item
     */
    const degree = (rawDegree + 360 + sectorDegree - offsetDegree) % 360

    return Math.floor(degree / sectorDegree)
  }

  const pointer = Pointer({
    width: window.innerWidth,
    height: window.innerHeight,

    offsetX: 10,
    offsetY: 10,

    onMove(position) {
      requestAnimationFrame(() => {
        $pointer.style.transform = `translate(${position.x}px, ${position.y}px)`
      })

      const index = sectorIndexFromPoint(position, sayu.options.sectorScaled)
      sayu.select(index)
    },
  })

  let $target: HTMLElement = sayu.containers.$root

  const lock = () => $target?.requestPointerLock()
  const unlock = () => document.exitPointerLock()
  const isPointerLocked = () => document.pointerLockElement === $target

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault()

      if (isPointerLocked()) {
        return
      }

      lock()
    }
  }

  const onKeyup = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault()

      unlock()
    }
  }

  const onPointerLockError = () => console.error(`[custom-cursor]: pointer lock error, browser version may be too low, try to update browser version to latest`)

  const MAX_INCORRECT_MOVEMENT = 50
  /**
   * 1. https://bugs.chromium.org/p/chromium/issues/detail?id=934658
   * movementX | movementY may get error num
   * @param event
   */
  const onMousemove = (event: MouseEvent) => {
    if (!isPointerLocked()) {
      return
    }

    if (Math.abs(event.movementX) > MAX_INCORRECT_MOVEMENT || Math.abs(event.movementY) > MAX_INCORRECT_MOVEMENT) {
      return
    }

    pointer.moveBy(event.movementX, event.movementY)
  }

  const showPointer = () => {
    requestAnimationFrame(() => {
      $pointer.style.display = 'flex'
    })
  }

  const hidePointer = () => {
    requestAnimationFrame(() => {
      $pointer.style.display = 'none'
    })
  }

  const onPointerActive = () => {
    pointer.moveTo(0.5, 0.5)
    showPointer()
    sayu.show()
    console.log('[custom-cursor]: lock pointer')

    document.addEventListener('mousemove', onMousemove)
  }

  const onPointerInactive = () => {
    hidePointer()
    sayu.hide()
    console.log('[custom-cursor]: unlock pointer')

    document.removeEventListener('mousemove', onMousemove)
  }

  const onPointerLockChange = () => isPointerLocked() ? onPointerActive() : onPointerInactive()
  const onResize = () => pointer.resizeCanvas(window.innerWidth, window.innerHeight)

  const mount = () => document.body.append($pointer as HTMLElement)
  const unmount = () => $pointer?.remove()

  const setup = () => {
    document.addEventListener('keydown', onKeydown)
    document.addEventListener('keyup', onKeyup)
    document.addEventListener('pointerlockerror', onPointerLockError)
    document.addEventListener('pointerlockchange', onPointerLockChange)
    window.addEventListener('resize', onResize)

    mount()
  }

  const release = () => {
    document.removeEventListener('keydown', onKeydown)
    document.removeEventListener('keyup', onKeyup)
    document.removeEventListener('pointerlockerror', onPointerLockError)
    document.removeEventListener('pointerlockchange', onPointerLockChange)
    window.removeEventListener('resize', onResize)

    unmount()

    // $pointer = null
    // $target = null
  }

  const beforeHide = () => sayu.triggerOnSelect()
  const afterHide = () => sayu.select(-1)

  return {
    name: 'custom-cursor',
    setup,
    release,
    beforeHide,
    afterHide,
  }
}
