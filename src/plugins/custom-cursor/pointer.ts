type PointerOptions = {
  width?: number
  height?: number

  x?: number
  y?: number

  offsetX?: number
  offsetY?: number

  onMove?: (position: Vector2D, canvas: Canvas2D) => void
}

const normalizeOptions = (rawOptions?: PointerOptions) => {
  const defaultOptions = {
    width: 0,
    height: 0,

    x: 0,
    y: 0,

    offsetX: 0,
    offsetY: 0,

    onMove: null,
  }

  const options = {
    ...defaultOptions,
    ...rawOptions,
  }

  return options
}

export const Pointer = (rawOptions?: PointerOptions) => {
  const options = normalizeOptions(rawOptions)

  const canvas: Canvas2D = {
    width: options.width,
    height: options.height,
  }

  const resizeCanvas = (width: number, height: number) => {
    canvas.width = width
    canvas.height = height
  }

  const position: Vector2D = {
    x: options.x,
    y: options.y,
  }

  const detect = (position: Vector2D, canvas: Canvas2D) => {
    const newPosition: Vector2D = {
      x: position.x,
      y: position.y,
    }

    if (position.x < options.offsetX) {
      newPosition.x = options.offsetX
    } else if (position.x > canvas.width - options.offsetX) {
      newPosition.x = canvas.width - options.offsetX
    }

    if (position.y < options.offsetY) {
      newPosition.y = options.offsetY
    } else if (position.y > canvas.height - options.offsetY) {
      newPosition.y = canvas.height - options.offsetY
    }

    return newPosition
  }

  const move = (x: number, y: number) => {
    const { x: validX, y: validY } = detect({ x, y }, canvas)

    position.x = validX
    position.y = validY

    options.onMove && options.onMove(position, canvas)

    return this
  }

  const moveTo = (percentX: number, percentY: number) => {
    move(canvas.width * percentX, canvas.height * percentY)

    return this
  }

  const moveBy = (deltaX: number, deltaY: number) => {
    move(position.x + deltaX, position.y + deltaY)

    return this
  }

  const getCanvas = () => canvas

  return {
    resizeCanvas,
    getCanvas,
    move,
    moveTo,
    moveBy,

    get centralPoint() {
      return {
        x: canvas.width / 2,
        y: canvas.height / 2,
      }
    }
  }
}
